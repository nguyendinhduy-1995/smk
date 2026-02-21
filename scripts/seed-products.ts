#!/usr/bin/env node

/**
 * Seed the database with scraped products from products.json
 * Run with: npx tsx scripts/seed-products.ts
 */

import db from '../src/lib/db';
import products from '../src/data/products.json';

function guessFrameShape(name: string): string | null {
    const n = name.toLowerCase();
    if (n.includes('aviator') || n.includes('phi công')) return 'AVIATOR';
    if (n.includes('cat-eye') || n.includes('mắt mèo') || n.includes('cat eye')) return 'CAT_EYE';
    if (n.includes('tròn') || n.includes('round') || n.includes('oval')) return 'ROUND';
    if (n.includes('vuông') || n.includes('square') || n.includes('rectangle') || n.includes('chữ nhật')) return 'SQUARE';
    if (n.includes('lục giác') || n.includes('bát giác') || n.includes('geometric') || n.includes('đa giác') || n.includes('ngũ giác')) return 'GEOMETRIC';
    if (n.includes('browline') || n.includes('clubmaster') || n.includes('nửa viền') || n.includes('nửa gọng') || n.includes('nua vien')) return 'BROWLINE';
    if (n.includes('oval')) return 'OVAL';
    return null;
}

function guessMaterial(name: string): string | null {
    const n = name.toLowerCase();
    if (n.includes('titanium') || n.includes('titan')) return 'TITANIUM';
    if (n.includes('tr90') || n.includes('tr-90')) return 'TR90';
    if (n.includes('acetate')) return 'ACETATE';
    if (n.includes('kim loại') || n.includes('metal') || n.includes('alloy') || n.includes('hợp kim')) return 'METAL';
    if (n.includes('nhựa') || n.includes('plastic')) return 'PLASTIC';
    if (n.includes('mixed') || n.includes('kết hợp')) return 'MIXED';
    return null;
}

function guessBrand(name: string): string | null {
    const brands = [
        'Camel', 'Louisika', 'Farzin', 'DI&J', 'Sedonna', 'Onassis', 'Kenzo',
        'Flowers', 'Freeman', 'GEDIFAN', 'GEHOF', 'E\'BICI', 'Ferragamo',
        'Nikon', 'Tazuna', 'Connect', 'OrientStar', 'Petersson', 'NIKKO',
        'Career Men', 'Air-Eagle', 'AIA-EAGLE', 'YBEIN', 'MIUSEN', 'Slaive',
        'Mone Sport', 'Marako', 'ANESSA', 'C.B.F', 'C.B.E', 'Dong Thai',
        'ĐÔNG THÁI', 'CA&A', 'BENEDICT', 'Young Fashion', 'Off?Noway',
        'JingDian', 'GMG',
    ];
    for (const brand of brands) {
        if (name.includes(brand)) return brand;
    }
    return null;
}

function guessGender(name: string): string | null {
    const n = name.toLowerCase();
    if (n.includes('nam nữ') || n.includes('unisex') || n.includes('nam/nữ')) return 'UNISEX';
    if (n.includes(' nữ ') || n.includes(' nữ,') || n.match(/nữ$/)) return 'FEMALE';
    if (n.includes(' nam ') || n.includes(' nam,') || n.match(/nam$/)) return 'MALE';
    return 'UNISEX';
}

function guessCategory(name: string, cat: string): string {
    const n = name.toLowerCase();
    if (n.includes('kính mát') || n.includes('kính râm') || cat === 'Kính Mát') return 'Kính Mát';
    if (n.includes('tròng kính') || cat === 'Tròng Kính') return 'Tròng Kính';
    return 'Gọng Kính';
}

function generateSKU(slug: string, index: number): string {
    const parts = slug
        .replace(/-/g, ' ')
        .split(' ')
        .filter(w => w.length > 2)
        .slice(0, 3)
        .map(w => w.slice(0, 3).toUpperCase());
    return `${parts.join('')}-${String(index + 1).padStart(3, '0')}`;
}

function guessFrameColor(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('đen')) return 'Đen';
    if (n.includes('vàng') || n.includes('gold') || n.includes('champagne')) return 'Vàng';
    if (n.includes('bạc') || n.includes('silver') || n.includes('gunmetal')) return 'Bạc';
    if (n.includes('nâu') || n.includes('tortoise') || n.includes('đồi mồi')) return 'Nâu';
    if (n.includes('hồng') || n.includes('rose') || n.includes('pink')) return 'Hồng';
    if (n.includes('xanh') || n.includes('blue')) return 'Xanh';
    if (n.includes('trắng') || n.includes('trong suốt') || n.includes('crystal')) return 'Trong suốt';
    if (n.includes('kem') || n.includes('cream')) return 'Kem';
    if (n.includes('đỏ') || n.includes('red')) return 'Đỏ';
    if (n.includes('tím') || n.includes('purple')) return 'Tím';
    return 'Đen';
}

async function main() {
    console.log('🌱 Seeding products into database...\n');

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
        const p = products[i] as any;

        // Skip if already exists
        const existing = await db.product.findUnique({ where: { slug: p.slug } });
        if (existing) {
            skipped++;
            continue;
        }

        const brand = guessBrand(p.name);
        const frameShape = guessFrameShape(p.name);
        const material = guessMaterial(p.name);
        const gender = guessGender(p.name);
        const category = guessCategory(p.name, p.category);
        const sku = generateSKU(p.slug, i);
        const frameColor = guessFrameColor(p.name);

        try {
            await db.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    brand,
                    description: p.description || null,
                    frameShape: frameShape as any,
                    material: material as any,
                    gender: gender as any,
                    category,
                    tags: p.tags || [],
                    status: 'ACTIVE',
                    publishedAt: new Date(),
                    variants: {
                        create: [{
                            sku,
                            frameColor,
                            price: p.price,
                            compareAtPrice: p.compareAt || null,
                            stockQty: Math.floor(Math.random() * 20) + 5,
                        }],
                    },
                    media: {
                        create: (p.images || []).map((img: string, idx: number) => ({
                            type: 'IMAGE' as const,
                            url: img,
                            sort: idx,
                        })),
                    },
                },
            });
            created++;
            process.stdout.write(`  [${i + 1}/${products.length}] ✓ ${p.name.slice(0, 50)}\n`);
        } catch (err: any) {
            console.error(`  [${i + 1}] ✗ ${p.name.slice(0, 40)} — ${err.message.slice(0, 80)}`);
        }
    }

    console.log(`\n✅ Seeded ${created} products (${skipped} already existed)`);
    await db.$disconnect();
}

main().catch(console.error);
