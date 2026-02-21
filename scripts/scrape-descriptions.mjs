#!/usr/bin/env node
/**
 * Scrape product descriptions from sieuthimatkinh.vn
 * Usage: node scripts/scrape-descriptions.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const PRODUCTS_PATH = resolve(process.cwd(), 'src/data/products.json');
const products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'));

const DELAY = 1500; // ms between requests
const MAX_CONCURRENT = 1;

async function fetchDescription(url) {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SMK-Sync/1.0)' },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return null;
        const html = await res.text();

        // Extract description from WooCommerce product page
        // Look for the product description tab content or short description
        let description = '';
        let shortDescription = '';

        // Short description: usually in <div class="product-short-description"> or similar
        const shortDescMatch = html.match(/<div[^>]*class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<div[^>]*class="[^"]*product-short-description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (shortDescMatch) {
            shortDescription = cleanHtml(shortDescMatch[1]);
        }

        // Full description: look for tab content
        const descMatch = html.match(/<div[^>]*id="tab-description"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)
            || html.match(/<div[^>]*class="[^"]*woocommerce-Tabs-panel--description[^"]*"[^>]*>([\s\S]*?)<\/div>/i)
            || html.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (descMatch) {
            description = cleanHtml(descMatch[1]);
        }

        // Fallback: try meta description
        if (!description && !shortDescription) {
            const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
            if (metaMatch) {
                shortDescription = metaMatch[1];
            }
        }

        // Extract specs from structured content (h2 > list pattern)
        const specsMatch = html.match(/Thông số kỹ thuật([\s\S]*?)(?:<h2|<\/div>)/i);
        const advantagesMatch = html.match(/Ưu điểm nổi bật([\s\S]*?)(?:<h2|<\/div>)/i);

        let specs = '';
        if (specsMatch) specs = cleanHtml(specsMatch[1]);
        let advantages = '';
        if (advantagesMatch) advantages = cleanHtml(advantagesMatch[1]);

        const fullDesc = [shortDescription, specs, advantages, description]
            .filter(Boolean)
            .join('\n\n')
            .trim()
            .substring(0, 2000); // Cap at 2000 chars

        return fullDesc || null;
    } catch (err) {
        console.error(`  ❌ Error fetching ${url}:`, err.message);
        return null;
    }
}

function cleanHtml(html) {
    return html
        .replace(/<[^>]+>/g, ' ')           // Remove HTML tags
        .replace(/&nbsp;/g, ' ')            // Replace &nbsp;
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#8211;/g, '–')
        .replace(/&#8220;|&#8221;/g, '"')
        .replace(/\s+/g, ' ')              // Collapse whitespace
        .replace(/\n\s*\n/g, '\n')         // Collapse newlines
        .trim();
}

async function main() {
    console.log(`\n📦 Scraping descriptions for ${products.length} products...\n`);
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < products.length; i++) {
        const p = products[i];

        // Skip if already has description
        if (p.description && p.description.length > 50) {
            skipped++;
            continue;
        }

        if (!p.sourceUrl) {
            console.log(`  ⏭️  [${i + 1}/${products.length}] ${p.name} — no sourceUrl`);
            skipped++;
            continue;
        }

        console.log(`  🔍 [${i + 1}/${products.length}] ${p.name}...`);
        const desc = await fetchDescription(p.sourceUrl);

        if (desc) {
            p.description = desc;
            updated++;
            console.log(`  ✅ Got ${desc.length} chars`);
        } else {
            failed++;
            console.log(`  ⚠️  No description found`);
        }

        // Delay
        await new Promise(r => setTimeout(r, DELAY));
    }

    // Save
    writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
    console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`);
    console.log(`📁 Saved to ${PRODUCTS_PATH}\n`);
}

main().catch(console.error);
