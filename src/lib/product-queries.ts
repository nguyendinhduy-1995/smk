import db from "@/lib/db";

export interface ProductItem {
    id: string;
    slug: string;
    name: string;
    price: number;
    compareAt: number | null;
    category: string | null;
    brand: string | null;
    image: string | null;
    images: string[];
    description: string;
    sku: string | null;
    stockQty: number;
    status: string;
}

function mapProduct(p: any): ProductItem {
    const variant = p.variants?.[0];
    const media = p.media || [];
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: variant?.price || 0,
        compareAt: variant?.compareAtPrice || null,
        category: p.category || null,
        brand: p.brand || null,
        image: media[0]?.url || null,
        images: media.map((m: any) => m.url),
        description: p.description || "",
        sku: variant?.sku || null,
        stockQty: variant?.stockQty || 0,
        status: p.status,
    };
}

const PRODUCT_INCLUDE = {
    variants: { where: { isActive: true }, take: 1, orderBy: { createdAt: "asc" as const } },
    media: { orderBy: { sort: "asc" as const } },
};

export async function getAllProducts(): Promise<ProductItem[]> {
    const products = await db.product.findMany({
        where: { status: "ACTIVE" },
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
    return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductItem | null> {
    const p = await db.product.findUnique({
        where: { slug },
        include: {
            variants: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
            media: { orderBy: { sort: "asc" } },
        },
    });
    if (!p) return null;
    return mapProduct(p);
}

export async function searchProducts(query: string): Promise<ProductItem[]> {
    const products = await db.product.findMany({
        where: {
            status: "ACTIVE",
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { tags: { has: query.toLowerCase() } },
            ],
        },
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
    return products.map(mapProduct);
}

export async function getProductsByCategory(category: string): Promise<ProductItem[]> {
    const products = await db.product.findMany({
        where: { status: "ACTIVE", category },
        include: PRODUCT_INCLUDE,
        orderBy: { createdAt: "desc" },
    });
    return products.map(mapProduct);
}

export async function getProductSlugs(): Promise<string[]> {
    const products = await db.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true },
    });
    return products.map((p) => p.slug);
}
