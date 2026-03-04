import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import db from "@/lib/db";

// GET /api/admin/warehouse — list all variant stock
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, "products");
    if (authError) return authError;

    const sp = req.nextUrl.searchParams;
    const search = sp.get("search") || sp.get("q") || "";
    const lowStockOnly = sp.get("lowStock") === "true";

    const where: Record<string, unknown> = { isActive: true };
    if (search) {
        where.OR = [
            { sku: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    const variants = await db.productVariant.findMany({
        where,
        include: {
            product: { select: { name: true, slug: true, brand: true, status: true } },
        },
        orderBy: { product: { name: "asc" } },
    });

    const items = variants
        .map((v) => ({
            id: v.id,
            sku: v.sku,
            name: v.product.name,
            brand: v.product.brand,
            frameColor: v.frameColor,
            slug: v.product.slug,
            productStatus: v.product.status,
            stockQty: v.stockQty,
            reserved: v.reservedQty,
            available: v.stockQty - v.reservedQty,
            price: v.price,
        }))
        .filter((item) => !lowStockOnly || item.available <= 5);

    const totalItems = items.length;
    const totalStock = items.reduce((s, i) => s + i.stockQty, 0);
    const lowStockCount = items.filter((i) => i.available <= 5).length;
    const outOfStockCount = items.filter((i) => i.available <= 0).length;

    return NextResponse.json({
        items,
        stats: { totalItems, totalStock, lowStockCount, outOfStockCount },
    });
}

// PUT /api/admin/warehouse — update stock for a variant
export async function PUT(req: NextRequest) {
    const authError = requireAdmin(req, "products");
    if (authError) return authError;

    const { variantId, stockQty, reservedQty } = await req.json();
    if (!variantId) {
        return NextResponse.json({ error: "variantId required" }, { status: 400 });
    }

    const data: Record<string, number> = {};
    if (typeof stockQty === "number") data.stockQty = stockQty;
    if (typeof reservedQty === "number") data.reservedQty = reservedQty;

    const updated = await db.productVariant.update({
        where: { id: variantId },
        data,
        include: { product: { select: { name: true } } },
    });

    return NextResponse.json({
        success: true,
        variant: {
            id: updated.id,
            sku: updated.sku,
            name: updated.product.name,
            stockQty: updated.stockQty,
            reserved: updated.reservedQty,
            available: updated.stockQty - updated.reservedQty,
        },
    });
}
