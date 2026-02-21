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

// POST /api/admin/products — create draft product with auto-slug
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        name, brand, category, description,
        frameShape, material, faceShape, style, gender,
        lensWidth, bridge, templeLength, sizeGuide,
        metaTitle, metaDesc, tags, status,
        variants, draftData,
    } = body;

    if (!name?.trim()) {
        return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });
    }

    // Auto-generate unique slug
    const baseSlug = name.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await db.product.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
    }

    const product = await db.product.create({
        data: {
            name: name.trim(), slug, brand, category, description,
            frameShape, material, faceShape: faceShape || [], style: style || [],
            gender, lensWidth, bridge, templeLength, sizeGuide,
            metaTitle, metaDesc, tags: tags || [],
            draftData: draftData || null,
            status: status || 'DRAFT',
            variants: variants?.length ? { create: variants } : undefined,
        },
        include: { variants: true, media: true },
    });

    return NextResponse.json({ product }, { status: 201 });
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
