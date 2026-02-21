import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/admin/products — list products for admin
export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const limit = Math.min(50, Number(sp.get('limit')) || 20);
    const status = sp.get('status') || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (sp.get('q')) {
        where.OR = [
            { name: { contains: sp.get('q')!, mode: 'insensitive' } },
            { sku: { contains: sp.get('q')!, mode: 'insensitive' } },
            { brand: { contains: sp.get('q')!, mode: 'insensitive' } },
        ];
    }

    const [products, total] = await Promise.all([
        db.product.findMany({
            where,
            include: {
                variants: { select: { id: true, sku: true, frameColor: true, price: true, stockQty: true, reservedQty: true } },
                _count: { select: { reviews: true, viewHistory: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.product.count({ where }),
    ]);

    return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

// POST /api/admin/products — create product
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        name, slug, brand, description,
        frameShape, material, faceShape, style, gender,
        lensWidth, bridge, templeLength,
        metaTitle, metaDesc, tags, status,
        variants,
    } = body;

    if (!name || !slug) {
        return NextResponse.json({ error: 'name and slug required' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const product = await db.product.create({
        data: {
            name, slug, brand, description,
            frameShape, material, faceShape: faceShape || [], style: style || [],
            gender, lensWidth, bridge, templeLength,
            metaTitle, metaDesc, tags: tags || [],
            status: status || 'DRAFT',
            variants: variants?.length ? { create: variants } : undefined,
        },
        include: { variants: true },
    });

    return NextResponse.json({ product }, { status: 201 });
}

// PATCH /api/admin/products — update product
export async function PATCH(req: NextRequest) {
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    const product = await db.product.update({
        where: { id },
        data,
        include: { variants: true },
    });

    return NextResponse.json({ product });
}

// DELETE /api/admin/products — delete product (soft archive)
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Product id required' }, { status: 400 });

    await db.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({ ok: true });
}
