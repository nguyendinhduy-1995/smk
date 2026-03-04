import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface JsonProduct {
    id: string;
    slug: string;
    name: string;
    sku: string | null;
    brand: string | null;
    price: number;
    compareAt: number | null;
    category: string | null;
    tags: string[];
    image: string;
    images: string[];
    description: string;
    sourceUrl: string;
}

function generateSku(slug: string, idx: number): string {
    const parts = slug.split("-").filter((w) => w.length > 1).slice(0, 3);
    return parts.map((w) => w.slice(0, 4).toUpperCase()).join("-") + "-" + String(idx + 1).padStart(3, "0");
}

async function main() {
    const jsonPath = path.join(process.cwd(), "src/data/products.json");
    const raw = fs.readFileSync(jsonPath, "utf8");
    const products: JsonProduct[] = JSON.parse(raw);

    console.log(`Found ${products.length} products in JSON. Starting import...`);

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < products.length; i++) {
        const p = products[i];

        // Skip if already exists
        const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (existing) {
            skipped++;
            continue;
        }

        const sku = p.sku || generateSku(p.slug, i);

        try {
            await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    brand: p.brand || null,
                    description: p.description || null,
                    category: p.category === "Uncategorized" ? null : p.category,
                    tags: p.tags || [],
                    status: "ACTIVE",
                    publishedAt: new Date(),
                    variants: {
                        create: {
                            sku,
                            frameColor: "Đen",
                            price: p.price || 0,
                            compareAtPrice: p.compareAt || null,
                            stockQty: 20,
                            reservedQty: 0,
                            isActive: true,
                        },
                    },
                    media: {
                        create: (p.images || [p.image]).filter(Boolean).map((url, idx) => ({
                            type: "IMAGE" as const,
                            url,
                            sort: idx,
                        })),
                    },
                },
            });
            created++;
            if (created % 20 === 0) console.log(`  Imported ${created}...`);
        } catch (err) {
            console.error(`  Error importing "${p.name}": ${err}`);
        }
    }

    console.log(`\nDone! Created: ${created}, Skipped (already exists): ${skipped}`);
    await prisma.$disconnect();
}

main().catch(console.error);
