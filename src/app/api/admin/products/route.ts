import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import catalogProducts from '@/data/products.json';

// Transform JSON catalog into admin-compatible format
function getStaticProducts(search?: string, status?: string) {
    let items = (catalogProducts as any[]).map((p, i) => ({
        id: p.id || String(i + 1),
        name: p.name,
        slug: p.slug,
        brand: p.brand || null,
        category: p.category || null,
        status: 'ACTIVE',
        tags: p.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        frameShape: null,
        material: null,
        gender: null,
        publishedAt: new Date().toISOString(),
        variants: [{
            id: `v-${p.id || i + 1}`,
            sku: `SKU-${String(i + 1).padStart(3, '0')}`,
            frameColor: 'Đen',
            lensColor: null,
            price: p.price || 0,
            compareAtPrice: p.compareAt || null,
            stockQty: Math.floor(Math.random() * 20) + 5,
            reservedQty: 0,
            isActive: true,
        }],
        media: (p.images || []).map((img: string, idx: number) => ({
            url: img,
            type: 'IMAGE',
            sort: idx,
        })),
    }));

    if (search) {
        const q = search.toLowerCase();
        items = items.filter(p => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q));
    }
    if (status && status !== 'all') {
        items = items.filter(p => p.status === status);
    }
    return items;
}

// GET /api/admin/products — list products for admin
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const limit = Math.min(100, Number(sp.get('limit')) || 50);
    const status = sp.get('status') || undefined;
    const search = sp.get('search') || sp.get('q') || undefined;

    // Try database first, fallback to static JSON
    try {
        const brand = sp.get('brand') || undefined;
        const sort = sp.get('sort') || sp.get('sortBy') || 'createdAt';
        const order = (sp.get('order') || sp.get('sortOrder')) === 'asc' ? 'asc' : 'desc' as const;

        const where: Record<string, unknown> = {};
        if (status && status !== 'all') where.status = status;
        if (brand) where.brand = brand;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } },
            ];
        }

        const [products, total] = await Promise.all([
            db.product.findMany({
                where,
                include: {
                    variants: { select: { id: true, sku: true, frameColor: true, lensColor: true, price: true, compareAtPrice: true, stockQty: true, reservedQty: true, isActive: true } },
                    media: { orderBy: { sort: 'asc' }, take: 3 },
                    _count: { select: { reviews: true, viewHistory: true } },
                },
                orderBy: { [sort]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            db.product.count({ where }),
        ]);

        return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch {
        // Fallback: serve from static JSON
        const allProducts = getStaticProducts(search, status);
        const total = allProducts.length;
        const sliced = allProducts.slice((page - 1) * limit, page * limit);
        return NextResponse.json({
            products: sliced,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            source: 'static',
        });
    }
}

// POST /api/admin/products — create product from wizard
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        name, slug: inputSlug, brand, category, description,
        frameShape, material, faceShape, style, gender,
        lensWidth, bridge, templeLength, sizeGuide,
        metaTitle, metaDesc, tags, status,
        variants, draftData,
        // New wizard fields
        price, compareAtPrice, initialQty, images,
        shortDesc, longDesc, bullets,
    } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });
    }

    // Try DB first, then fallback to JSON append
    try {
        // Auto-generate unique slug
        const baseSlug = (inputSlug || name).trim().toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let slug = baseSlug;
        let counter = 1;
        while (await db.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        // Build variant: either from explicit variants or auto from price
        const variantData = variants?.length ? variants : (price ? [{
            sku: `${slug.split('-').slice(0, 3).map((w: string) => w.slice(0, 3).toUpperCase()).join('')}-001`,
            frameColor: 'Default',
            price: Number(price),
            compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
            stockQty: Number(initialQty) || 0,
        }] : undefined);

        // Build media from images array
        const mediaData = images?.length ? images.map((url: string, i: number) => ({
            type: 'IMAGE' as const,
            url,
            sort: i,
        })) : undefined;

        // Build description from shortDesc/longDesc/bullets
        const fullDesc = description || [
            shortDesc,
            longDesc,
            bullets?.length ? '\n\n' + bullets.filter(Boolean).map((b: string) => `• ${b}`).join('\n') : '',
        ].filter(Boolean).join('\n\n');

        const isPublish = status === 'ACTIVE';

        const product = await db.product.create({
            data: {
                name: name.trim(), slug, brand, category, description: fullDesc,
                frameShape, material, faceShape: faceShape || [], style: style || [],
                gender, lensWidth, bridge, templeLength, sizeGuide,
                metaTitle, metaDesc, tags: tags || [],
                draftData: draftData || null,
                status: status || 'DRAFT',
                publishedAt: isPublish ? new Date() : undefined,
                variants: variantData ? { create: variantData } : undefined,
                media: mediaData ? { create: mediaData } : undefined,
            },
            include: { variants: true, media: true },
        });

        // Create inventory ledger receipt for OPENING_STOCK
        if (isPublish && Number(initialQty) > 0 && product.variants[0]) {
            try {
                // Find or create default warehouse
                let warehouse = await db.warehouse.findFirst({ where: { isActive: true } });
                if (!warehouse) {
                    warehouse = await db.warehouse.create({
                        data: { name: 'Kho Chính', code: 'KHO-CHINH', isActive: true },
                    });
                }

                // Create voucher
                const voucherCode = `VCH-IN-${Date.now().toString(36).toUpperCase()}`;
                const voucher = await db.inventoryVoucher.create({
                    data: {
                        code: voucherCode,
                        type: 'RECEIPT',
                        status: 'POSTED',
                        warehouseId: warehouse.id,
                        reason: 'OPENING_STOCK',
                        note: `Tồn đầu kỳ cho sản phẩm: ${name}`,
                        createdBy: 'admin',
                        postedAt: new Date(),
                        items: {
                            create: [{
                                variantId: product.variants[0].id,
                                qty: Number(initialQty),
                                note: 'OPENING_STOCK',
                            }],
                        },
                    },
                });

                // Create ledger entry
                await db.inventoryLedger.create({
                    data: {
                        variantId: product.variants[0].id,
                        warehouseId: warehouse.id,
                        type: 'RECEIPT',
                        qty: Number(initialQty),
                        balance: Number(initialQty),
                        refType: 'voucher',
                        refId: voucher.id,
                        note: 'OPENING_STOCK',
                        createdBy: 'admin',
                    },
                });
            } catch (ledgerErr) {
                console.error('[Ledger]', ledgerErr);
                // Non-fatal: product is created, ledger failed
            }
        }

        return NextResponse.json({ product }, { status: 201 });
    } catch (dbErr) {
        // Fallback: append to products.json
        console.error('[DB Create]', dbErr);
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const jsonPath = path.join(process.cwd(), 'src', 'data', 'products.json');
            const existing = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));

            const newProduct = {
                id: String(existing.length + 1),
                slug: (inputSlug || name).trim().toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                name: name.trim(),
                sku: null, brand: brand || null,
                price: Number(price) || 0,
                compareAt: compareAtPrice ? Number(compareAtPrice) : null,
                category: category || 'Uncategorized',
                tags: tags || [],
                image: images?.[0] || null,
                images: images || [],
                description: description || shortDesc || '',
                sourceUrl: '',
            };

            existing.push(newProduct);
            await fs.writeFile(jsonPath, JSON.stringify(existing, null, 2), 'utf-8');

            return NextResponse.json({ product: newProduct, source: 'json' }, { status: 201 });
        } catch (jsonErr) {
            console.error('[JSON Fallback]', jsonErr);
            return NextResponse.json({ error: 'Không thể tạo sản phẩm' }, { status: 500 });
        }
    }
}

// PATCH /api/admin/products — update / autosave draft / publish
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, action, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    // Publish validation
    if (action === 'publish') {
        const product = await db.product.findUnique({
            where: { id },
            include: { variants: true, media: true },
        });
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const errors: string[] = [];
        if (!product.media.length) errors.push('Thiếu ảnh sản phẩm');
        if (!product.variants.length) errors.push('Cần ít nhất 1 biến thể');
        if (product.variants.some((v: { price: number }) => v.price <= 0)) errors.push('Giá phải > 0');
        if (product.variants.some((v: { stockQty: number }) => v.stockQty < 0)) errors.push('Tồn kho không được âm');

        const skus = product.variants.map((v: { sku: string }) => v.sku);
        const dupes = skus.filter((s: string, i: number) => skus.indexOf(s) !== i);
        if (dupes.length) errors.push(`SKU trùng: ${dupes.join(', ')}`);

        if (errors.length) {
            return NextResponse.json({ error: 'Không thể publish', errors }, { status: 422 });
        }

        const updated = await db.product.update({
            where: { id },
            data: { status: 'ACTIVE', publishedAt: new Date(), draftData: undefined },
            include: { variants: true, media: true },
        });
        return NextResponse.json({ product: updated });
    }

    const product = await db.product.update({
        where: { id },
        data,
        include: { variants: true, media: true },
    });

    return NextResponse.json({ product });
}

// DELETE /api/admin/products — soft archive
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    await db.product.update({ where: { id }, data: { status: 'ARCHIVED' } });
    return NextResponse.json({ ok: true });
}
