#!/usr/bin/env node

/**
 * Fix product image filenames: rename URL-encoded chars to clean ASCII
 * Also updates products.json paths accordingly
 */

const fs = require('fs');
const path = require('path');

const PRODUCT_DIR = path.join(__dirname, '..', 'public', 'products');
const JSON_FILE = path.join(__dirname, '..', 'src', 'data', 'products.json');

// 1. Rename files with URL-encoded chars
const files = fs.readdirSync(PRODUCT_DIR);
const renameMap = {};

for (const file of files) {
    if (file.includes('%')) {
        let clean = decodeURIComponent(file);
        // Remove emojis and special unicode
        clean = clean
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
            .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
            .replace(/^-+/, '') // Remove leading dashes
            .replace(/-+/g, '-') // Collapse multiple dashes
            .trim();

        if (!clean || clean === '.jpg' || clean === '.png' || clean === '.webp') {
            // If name is empty after cleaning, use hash
            clean = `product-${Math.random().toString(36).slice(2, 8)}${path.extname(file)}`;
        }

        const oldPath = path.join(PRODUCT_DIR, file);
        const newPath = path.join(PRODUCT_DIR, clean);

        if (fs.existsSync(newPath)) {
            // Add suffix if name collision
            const ext = path.extname(clean);
            const base = path.basename(clean, ext);
            clean = `${base}-x${ext}`;
        }

        const finalPath = path.join(PRODUCT_DIR, clean);
        fs.renameSync(oldPath, finalPath);
        renameMap[`/products/${file}`] = `/products/${clean}`;
        console.log(`  ✓ ${file} → ${clean}`);
    }
}

console.log(`\nRenamed ${Object.keys(renameMap).length} files\n`);

// 2. Update products.json
const products = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));

let updatedCount = 0;
for (const product of products) {
    // Fix slug
    if (product.slug && product.slug.includes('%')) {
        let cleanSlug = decodeURIComponent(product.slug);
        cleanSlug = cleanSlug
            .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
            .replace(/[^\x00-\x7F]/g, '')
            .replace(/^-+/, '')
            .replace(/-+/g, '-')
            .trim();
        product.slug = cleanSlug;
    }

    // Fix image paths
    if (product.image && renameMap[product.image]) {
        product.image = renameMap[product.image];
        updatedCount++;
    }
    if (product.images) {
        product.images = product.images.map(img => renameMap[img] || img);
    }

    // Also clean product names (remove leading emoji)
    if (product.name) {
        product.name = product.name
            .replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\s]+/gu, '')
            .trim();
    }
}

fs.writeFileSync(JSON_FILE, JSON.stringify(products, null, 2), 'utf-8');
console.log(`Updated ${updatedCount} image references in products.json`);
console.log('✅ Done!');
