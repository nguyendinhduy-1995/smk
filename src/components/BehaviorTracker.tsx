'use client';

/**
 * BehaviorTracker — tracks user page views, clicks, and product interactions
 * in localStorage. Sends analytics summary to /api/analytics/track periodically.
 * Also exposes hooks for dynamic menu suggestions.
 */

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

// Types
interface PageView {
    path: string;
    ts: number;
    referrer?: string;
}

interface ProductView {
    slug: string;
    name: string;
    category: string;
    price: number;
    ts: number;
}

interface UserAction {
    type: 'click' | 'add_cart' | 'buy' | 'search' | 'filter';
    target: string;
    ts: number;
}

interface BehaviorData {
    sessionId: string;
    pageViews: PageView[];
    productViews: ProductView[];
    actions: UserAction[];
    firstVisit: number;
    lastVisit: number;
    visitCount: number;
}

const STORAGE_KEY = 'smk_behavior';
const MAX_ITEMS = 100;

function generateSessionId(): string {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getStoredBehavior(): BehaviorData {
    if (typeof window === 'undefined') {
        return { sessionId: '', pageViews: [], productViews: [], actions: [], firstVisit: 0, lastVisit: 0, visitCount: 0 };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    const now = Date.now();
    return {
        sessionId: generateSessionId(),
        pageViews: [],
        productViews: [],
        actions: [],
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
    };
}

function saveBehavior(data: BehaviorData) {
    if (typeof window === 'undefined') return;
    // Trim to max items
    data.pageViews = data.pageViews.slice(-MAX_ITEMS);
    data.productViews = data.productViews.slice(-MAX_ITEMS);
    data.actions = data.actions.slice(-MAX_ITEMS);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* quota exceeded */ }
}

// Track a page view
export function trackPageView(path: string) {
    const data = getStoredBehavior();
    data.pageViews.push({ path, ts: Date.now(), referrer: typeof document !== 'undefined' ? document.referrer : undefined });
    data.lastVisit = Date.now();
    data.visitCount++;
    saveBehavior(data);
    // Send to API (non-blocking)
    sendToApi(data);
}

// Track a product view 
export function trackProductView(slug: string, name: string, category: string, price: number) {
    const data = getStoredBehavior();
    data.productViews.push({ slug, name, category, price, ts: Date.now() });
    saveBehavior(data);
}

// Track an action
export function trackAction(type: UserAction['type'], target: string) {
    const data = getStoredBehavior();
    data.actions.push({ type, target, ts: Date.now() });
    saveBehavior(data);
}

// Send analytics to API
async function sendToApi(data: BehaviorData) {
    try {
        await fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: data.sessionId,
                pageCount: data.pageViews.length,
                productViewCount: data.productViews.length,
                actionCount: data.actions.length,
                visitCount: data.visitCount,
                currentPath: data.pageViews[data.pageViews.length - 1]?.path || '/',
                lastProducts: data.productViews.slice(-5).map(p => p.slug),
                categories: [...new Set(data.productViews.map(p => p.category))],
                priceRange: data.productViews.length > 0 ? {
                    min: Math.min(...data.productViews.map(p => p.price)),
                    max: Math.max(...data.productViews.map(p => p.price)),
                    avg: data.productViews.reduce((s, p) => s + p.price, 0) / data.productViews.length,
                } : null,
                actions: data.actions.slice(-10),
            }),
        });
    } catch { /* silent */ }
}

// Get dynamic menu suggestions based on behavior
export function getDynamicMenuItems(): { href: string; icon: string; label: string }[] {
    const data = getStoredBehavior();
    const items: { href: string; icon: string; label: string; score: number }[] = [];

    // Analyze product views for category suggestions
    const categoryCounts: Record<string, number> = {};
    const brandCounts: Record<string, number> = {};
    const priceBuckets = { budget: 0, mid: 0, premium: 0 };

    for (const pv of data.productViews) {
        categoryCounts[pv.category] = (categoryCounts[pv.category] || 0) + 1;
        if (pv.price < 500000) priceBuckets.budget++;
        else if (pv.price < 1500000) priceBuckets.mid++;
        else priceBuckets.premium++;
    }

    // Analyze page views
    const pagePatterns: Record<string, number> = {};
    for (const pv of data.pageViews) {
        const key = pv.path.split('?')[0];
        pagePatterns[key] = (pagePatterns[key] || 0) + 1;
    }

    // Dynamic suggestions based on behavior
    const POTENTIAL_ITEMS = [
        { href: '/search?category=kinh-mat', icon: '👓', label: 'Kính mắt', cat: 'kinh-mat' },
        { href: '/search?category=kinh-ram', icon: '🕶️', label: 'Kính râm', cat: 'kinh-ram' },
        { href: '/search?category=gong-kinh', icon: '🔲', label: 'Gọng kính', cat: 'gong-kinh' },
        { href: '/search?maxPrice=500000', icon: '💰', label: 'Dưới 500K', cat: 'budget' },
        { href: '/search?minPrice=1500000', icon: '💎', label: 'Cao cấp', cat: 'premium' },
        { href: '/c/best-sellers', icon: '🔥', label: 'Bán chạy', cat: 'hot' },
        { href: '/search?tag=sale', icon: '🏷️', label: 'Đang giảm giá', cat: 'sale' },
        { href: '/wishlist', icon: '❤️', label: 'Yêu thích', cat: 'wishlist' },
        { href: '/orders', icon: '📦', label: 'Đơn hàng', cat: 'orders' },
        { href: '/track', icon: '🚚', label: 'Tra cứu vận đơn', cat: 'track' },
    ];

    for (const item of POTENTIAL_ITEMS) {
        let score = 0;

        // Boost by category view frequency
        if (categoryCounts[item.cat]) score += categoryCounts[item.cat] * 10;

        // Boost by price preference
        if (item.cat === 'budget' && priceBuckets.budget > 2) score += 15;
        if (item.cat === 'premium' && priceBuckets.premium > 2) score += 15;

        // Boost by page visit pattern
        if (pagePatterns[item.href.split('?')[0]]) score += pagePatterns[item.href.split('?')[0]] * 5;

        // Boost wishlist/orders if user has visited account
        if ((item.cat === 'wishlist' || item.cat === 'orders') && pagePatterns['/account']) score += 10;
        if (item.cat === 'track' && data.actions.some(a => a.type === 'buy')) score += 20;

        // Always show sale and hot items with base score
        if (item.cat === 'sale') score += 8;
        if (item.cat === 'hot') score += 7;

        items.push({ ...item, score });
    }

    // Sort by score and return top 5
    return items
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(({ href, icon, label }) => ({ href, icon, label }));
}

// Auto-track component — place in layout
export default function BehaviorTracker() {
    const pathname = usePathname();

    const track = useCallback(() => {
        trackPageView(pathname);
    }, [pathname]);

    useEffect(() => {
        track();
    }, [track]);

    // Track clicks on product links
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[href*="/p/"]');
            if (link) {
                const href = link.getAttribute('href') || '';
                const slug = href.split('/p/')[1]?.split('?')[0];
                if (slug) trackAction('click', slug);
            }
            const buyBtn = target.closest('[class*="btn-primary"]');
            if (buyBtn) {
                trackAction('buy', pathname);
            }
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [pathname]);

    return null;
}
