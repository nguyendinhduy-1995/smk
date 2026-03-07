import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

type Product = {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string;
    image: string | null; images: string[]; description: string;
    brand?: string | null; tags?: string[];
};

// Scoring weights
const WEIGHTS = {
    sameCategory: 30,
    sameBrand: 25,
    similarPrice: 20, // within 30% price range
    sameTags: 15,
    nameOverlap: 10, // shared keywords in name
    hasDiscount: 5,
};

function getKeywords(name: string): string[] {
    return name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/[\s\-–·,]+/)
        .filter(w => w.length > 2);
}

function scoreSimilarity(base: Product, candidate: Product): number {
    let score = 0;

    // Same category
    if (base.category && candidate.category === base.category) score += WEIGHTS.sameCategory;

    // Same brand
    if (base.brand && candidate.brand === base.brand) score += WEIGHTS.sameBrand;

    // Similar price (within 30%)
    const priceDiff = Math.abs(base.price - candidate.price) / Math.max(base.price, 1);
    if (priceDiff <= 0.3) score += WEIGHTS.similarPrice * (1 - priceDiff);

    // Shared tags
    if (base.tags?.length && candidate.tags?.length) {
        const baseTags = new Set(base.tags);
        const shared = candidate.tags.filter(t => baseTags.has(t));
        if (shared.length > 0) score += WEIGHTS.sameTags * Math.min(shared.length / 3, 1);
    }

    // Name keyword overlap
    const baseWords = getKeywords(base.name);
    const candWords = new Set(getKeywords(candidate.name));
    const overlap = baseWords.filter(w => candWords.has(w)).length;
    if (overlap > 0) score += WEIGHTS.nameOverlap * Math.min(overlap / 3, 1);

    // Has discount bonus
    if (candidate.compareAt && candidate.compareAt > candidate.price) {
        score += WEIGHTS.hasDiscount;
    }

    return score;
}

function mapDbProduct(p: any): Product {
    const variant = p.variants?.[0];
    const media = p.media || [];
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: variant?.price || 0,
        compareAt: variant?.compareAtPrice || null,
        category: p.category || '',
        brand: p.brand || null,
        image: media[0]?.url || null,
        images: media.map((m: any) => m.url),
        description: p.description || '',
        tags: p.tags || [],
    };
}

// GET /api/ai/recommendations?productId=xxx&limit=8
export async function GET(req: NextRequest) {
    const productId = req.nextUrl.searchParams.get('productId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '8');

    if (!productId) {
        return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    try {
        const include = {
            variants: { where: { isActive: true }, take: 1, orderBy: { createdAt: 'asc' as const } },
            media: { orderBy: { sort: 'asc' as const } },
        };

        const dbProduct = await db.product.findUnique({
            where: { id: productId },
            include,
        });

        if (!dbProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const baseProduct = mapDbProduct(dbProduct);

        // Fetch all active products for scoring
        const allDbProducts = await db.product.findMany({
            where: { status: 'ACTIVE' },
            include,
        });

        const products = allDbProducts.map(mapDbProduct);

        // Score all other products
        const scored = products
            .filter(p => p.id !== productId)
            .map(p => ({ product: p, score: scoreSimilarity(baseProduct, p) }))
            .sort((a, b) => b.score - a.score);

        // AI-similar (high score)
        const similar = scored.slice(0, limit).map(s => ({
            id: s.product.id,
            slug: s.product.slug,
            name: s.product.name,
            price: s.product.price,
            compareAt: s.product.compareAt,
            category: s.product.category,
            brand: s.product.brand || null,
            image: s.product.image || (s.product.images?.[0]) || null,
            score: Math.round(s.score),
            reason: getRecommendationReason(baseProduct, s.product, s.score),
        }));

        // Also pick some random "discovery" products (different category to broaden)
        const otherCategory = products
            .filter(p => p.id !== productId && p.category !== baseProduct.category)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map(p => ({
                id: p.id, slug: p.slug, name: p.name, price: p.price,
                compareAt: p.compareAt, category: p.category, brand: p.brand || null,
                image: p.image || (p.images?.[0]) || null, score: 0,
                reason: '🔍 Khám phá thêm',
            }));

        return NextResponse.json({
            similar,
            discovery: otherCategory,
            baseProduct: { id: baseProduct.id, name: baseProduct.name, category: baseProduct.category, brand: baseProduct.brand },
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function getRecommendationReason(base: Product, candidate: Product, score: number): string {
    if (base.brand && candidate.brand === base.brand) return `🏷️ Cùng thương hiệu ${base.brand}`;
    if (base.category && candidate.category === base.category) {
        const priceDiff = Math.abs(base.price - candidate.price) / Math.max(base.price, 1);
        if (priceDiff <= 0.15) return '💰 Cùng tầm giá';
        return '📂 Cùng danh mục';
    }
    if (score > 50) return '🤖 AI gợi ý';
    if (candidate.compareAt && candidate.compareAt > candidate.price) return '🔥 Đang giảm giá';
    return '✨ Có thể bạn thích';
}
