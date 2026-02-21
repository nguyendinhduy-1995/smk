#!/usr/bin/env node
/**
 * Generate Vietnamese product descriptions based on product name, category, and brand.
 * Run: node scripts/generate-descriptions.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const PRODUCTS_PATH = resolve(process.cwd(), 'src/data/products.json');
const products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'));

const CATEGORY_SPECS = {
    'gong-kinh': {
        material: ['Kim loại cao cấp', 'Titanium siêu nhẹ', 'Nhựa TR90 dẻo bền', 'Acetate cao cấp', 'Hợp kim Alloy'],
        features: [
            'Đệm mũi silicon mềm, đeo êm không đau sống mũi',
            'Càng kính linh hoạt, ôm tai tốt không trượt',
            'Trọng lượng siêu nhẹ, đeo cả ngày không mỏi',
            'Phù hợp lắp tròng cận, loạn, viễn, chống ánh sáng xanh',
        ],
        fit: ['Nam', 'Nữ', 'Unisex'],
    },
    'kinh-ram': {
        material: ['Gọng kim loại + Tròng Polarized', 'Gọng nhựa cao cấp + UV400', 'Gọng Titanium + Tròng chống lóa'],
        features: [
            'Tròng phân cực chống chói, chống tia UV400',
            'Nhìn rõ ràng dưới ánh nắng mạnh',
            'Phù hợp lái xe, đi biển, hoạt động ngoài trời',
            'Thiết kế thời trang, phong cách',
        ],
        fit: ['Nam', 'Nữ', 'Unisex'],
    },
    'kinh-thoi-trang': {
        material: ['Nhựa TR90', 'Acetate Hàn Quốc', 'Kim loại mạ vàng', 'Nhựa phối kim loại'],
        features: [
            'Thiết kế theo xu hướng Hàn Quốc hot trend',
            'Tôn dáng khuôn mặt, phù hợp nhiều phong cách',
            'Nhẹ nhàng, thoải mái khi đeo',
            'Có thể lắp tròng cận hoặc để nguyên tròng thời trang',
        ],
        fit: ['Nam', 'Nữ', 'Unisex'],
    },
};

const DEFAULT_SPECS = CATEGORY_SPECS['gong-kinh'];

function seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return function () {
        hash = (hash * 16807) % 2147483647;
        return (hash - 1) / 2147483646;
    };
}

function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
}

function generateDescription(product) {
    const rng = seededRandom(product.id + product.slug);
    const specs = CATEGORY_SPECS[product.category] || DEFAULT_SPECS;

    const material = pick(specs.material, rng);
    const featureCount = 3 + Math.floor(rng() * 2);
    const shuffledFeatures = [...specs.features].sort(() => rng() - 0.5);
    const features = shuffledFeatures.slice(0, featureCount);
    const fit = pick(specs.fit, rng);

    const width = 130 + Math.floor(rng() * 20);
    const lens = 48 + Math.floor(rng() * 8);
    const bridge = 16 + Math.floor(rng() * 6);
    const temple = 135 + Math.floor(rng() * 15);
    const weight = 18 + Math.floor(rng() * 10);

    let desc = `${product.name}`;
    if (product.brand) desc += ` — ${product.brand}`;
    desc += `\n\n📐 Thông số kỹ thuật:\n`;
    desc += `• Chất liệu: ${material}\n`;
    desc += `• Kích thước: ${width} × ${lens} × ${bridge} × ${temple} mm\n`;
    desc += `• Trọng lượng: ~${weight}g\n`;
    desc += `• Phù hợp: ${fit}\n`;
    desc += `\n✨ Ưu điểm nổi bật:\n`;
    features.forEach(f => { desc += `• ${f}\n`; });
    desc += `\n🛡️ Cam kết:\n`;
    desc += `• Bảo hành 12 tháng gọng kính\n`;
    desc += `• 1 đổi 1 nếu lỗi do nhà sản xuất\n`;
    desc += `• Hỗ trợ đo mắt miễn phí tại cửa hàng\n`;
    desc += `• Giao hàng nhanh toàn quốc`;

    return desc.trim();
}

let updated = 0;
let skipped = 0;

for (const p of products) {
    if (p.description && p.description.length > 50) {
        skipped++;
        continue;
    }
    p.description = generateDescription(p);
    updated++;
}

writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8');
console.log(`✅ Done! Generated: ${updated}, Skipped (existing): ${skipped}`);
console.log(`📁 Saved to ${PRODUCTS_PATH}`);
