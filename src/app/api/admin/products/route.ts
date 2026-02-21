import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/admin/products — list products for admin
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const limit = Math.min(100, Number(sp.get('limit')) || 50);
    const status = sp.get('status') || undefined;
    const brand = sp.get('brand') || undefined;
    const sort = sp.get('sort') || 'createdAt';
    const order = sp.get('order') === 'asc' ? 'asc' : 'desc' as const;

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (brand) where.brand = brand;
    if (sp.get('q')) {
        where.OR = [
            { name: { contains: sp.get('q')!, mode: 'insensitive' } },
            { brand: { contains: sp.get('q')!, mode: 'insensitive' } },
            { tags: { has: sp.get('q')!.toLowerCase() } },
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
