#!/usr/bin/env node

/**
 * Scrape all products from sieuthimatkinh.vn (WooCommerce)
 * Extracts: name, slug, price, compareAt, category, image URL, description
 * Downloads product images to public/products/
 * Outputs products.json seed file
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const BASE = 'https://sieuthimatkinh.vn';
const SHOP_URL = `${BASE}/cua-hang/`;
const PAGES = 5;
const OUT_DIR = path.join(__dirname, '..', 'public', 'products');
const JSON_OUT = path.join(__dirname, '..', 'src', 'data', 'products.json');

// Ensure dirs
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(JSON_OUT), { recursive: true });

function fetch(url) {
    return new Promise((resolve, reject) => {
        const mod = url.startsWith('https') ? https : http;
        mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetch(res.headers.location).then(resolve).catch(reject);
            }
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

async function getProductLinksFromPage(pageNum) {
    const url = pageNum === 1 ? SHOP_URL : `${SHOP_URL}page/${pageNum}/`;
    console.log(`  Fetching shop page ${pageNum}: ${url}`);
    const html = (await fetch(url)).toString();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const links = new Set();
    // WooCommerce product links
    doc.querySelectorAll('a[href*="/san-pham/"]').forEach((a) => {
        const href = a.href;
        if (href && href.includes('/san-pham/')) {
            links.add(href.startsWith('http') ? href : BASE + href);
        }
    });

    return [...links];
}

async function scrapeProduct(url) {
    try {
        console.log(`    Scraping: ${url}`);
        const html = (await fetch(url)).toString();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Name
        const nameEl = doc.querySelector('.product_title, h1.entry-title, h1');
        const name = nameEl ? nameEl.textContent.trim() : '';
        if (!name) return null;

        // Price
        let price = 0;
        let compareAt = null;

        const priceContainer = doc.querySelector('.summary .price, .product .price');
        if (priceContainer) {
            const delEl = priceContainer.querySelector('del .woocommerce-Price-amount, del');
            const insEl = priceContainer.querySelector('ins .woocommerce-Price-amount, ins');
            const singlePrice = priceContainer.querySelector('.woocommerce-Price-amount');

            if (delEl && insEl) {
                compareAt = parseInt(delEl.textContent.replace(/[^\d]/g, '')) || null;
                price = parseInt(insEl.textContent.replace(/[^\d]/g, '')) || 0;
            } else if (singlePrice) {
                price = parseInt(singlePrice.textContent.replace(/[^\d]/g, '')) || 0;
            }
        }

        // Category
        const catEl = doc.querySelector('.posted_in a, .product_meta .posted_in a');
        const category = catEl ? catEl.textContent.trim() : 'Uncategorized';

        // Tags
        const tags = [];
        doc.querySelectorAll('.tagged_as a, .product_meta .tagged_as a').forEach((t) => {
            tags.push(t.textContent.trim());
        });

        // Images
        const images = [];
        const mainImg = doc.querySelector('.woocommerce-product-gallery__image img, .wp-post-image');
        if (mainImg) {
            const src = mainImg.getAttribute('data-large_image') || mainImg.getAttribute('data-src') || mainImg.getAttribute('src');
            if (src) images.push(src.startsWith('http') ? src : BASE + src);
        }
        // Gallery images
        doc.querySelectorAll('.woocommerce-product-gallery__image img').forEach((img) => {
            const src = img.getAttribute('data-large_image') || img.getAttribute('data-src') || img.getAttribute('src');
            if (src) {
                const fullSrc = src.startsWith('http') ? src : BASE + src;
                if (!images.includes(fullSrc)) images.push(fullSrc);
            }
        });

        // Description (short)
        const shortDesc = doc.querySelector('.woocommerce-product-details__short-description');
        const description = shortDesc ? shortDesc.textContent.trim().slice(0, 500) : '';

        // SKU
        const skuEl = doc.querySelector('.sku');
        const sku = skuEl ? skuEl.textContent.trim() : '';

        // Extract slug from URL
        const urlSlug = url.replace(/\/$/, '').split('/').pop() || slugify(name);

        return {
            name,
            slug: urlSlug,
            sku,
            price,
            compareAt,
            category,
            tags,
            images,
            description,
            sourceUrl: url,
        };
    } catch (err) {
        console.error(`    ERROR scraping ${url}:`, err.message);
        return null;
    }
}

async function downloadImage(imageUrl, slug, index) {
    try {
        const ext = path.extname(new URL(imageUrl).pathname).split('?')[0] || '.jpg';
        const filename = index === 0 ? `${slug}${ext}` : `${slug}-${index}${ext}`;
        const filepath = path.join(OUT_DIR, filename);

        if (fs.existsSync(filepath)) {
            return `/products/${filename}`;
        }

        const data = await fetch(imageUrl);
        fs.writeFileSync(filepath, data);
        return `/products/${filename}`;
    } catch (err) {
        console.error(`    Failed to download ${imageUrl}:`, err.message);
        return null;
    }
}

async function main() {
    console.log('🔍 Scraping sieuthimatkinh.vn...\n');

    // 1. Collect all product URLs
    const allLinks = new Set();
    for (let p = 1; p <= PAGES; p++) {
        const links = await getProductLinksFromPage(p);
        links.forEach((l) => allLinks.add(l));
        console.log(`    Found ${links.length} links on page ${p}`);
    }

    const productUrls = [...allLinks].sort();
    console.log(`\n📦 Total unique product URLs: ${productUrls.length}\n`);

    // 2. Scrape each product
    const products = [];
    for (let i = 0; i < productUrls.length; i++) {
        const product = await scrapeProduct(productUrls[i]);
        if (product) {
            products.push(product);
            process.stdout.write(`  [${i + 1}/${productUrls.length}] ${product.name.slice(0, 50)}...\n`);
        }
        // Be polite: 300ms delay
        await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`\n✅ Scraped ${products.length} products\n`);

    // 3. Download images
    console.log('📸 Downloading images...\n');
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const localImages = [];
        for (let j = 0; j < p.images.length; j++) {
            const localPath = await downloadImage(p.images[j], p.slug, j);
            if (localPath) localImages.push(localPath);
            await new Promise((r) => setTimeout(r, 200));
        }
        p.localImages = localImages;
        p.image = localImages[0] || null;
        process.stdout.write(`  [${i + 1}/${products.length}] ${localImages.length} imgs for ${p.name.slice(0, 40)}\n`);
    }

    // 4. Save JSON
    const output = products.map((p, idx) => ({
        id: String(idx + 1),
        slug: p.slug,
        name: p.name,
        sku: p.sku || null,
        brand: null, // WooCommerce doesn't have brand by default
        price: p.price,
        compareAt: p.compareAt,
        category: p.category,
        tags: p.tags,
        image: p.image,
        images: p.localImages,
        description: p.description,
        sourceUrl: p.sourceUrl,
    }));

    fs.writeFileSync(JSON_OUT, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`\n💾 Saved ${output.length} products to ${JSON_OUT}`);
    console.log(`📁 Images saved to ${OUT_DIR}`);
    console.log('\n🎉 Done!');
}

main().catch(console.error);
