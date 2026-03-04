'use client';

/**
 * BehaviorTracker — comprehensive user behavior tracking
 * Tracks: page views, product views, clicks, scroll depth, time on page,
 * device info, referrer, entry/exit pages, user flow, screen resolution.
 * Sends analytics summary to /api/analytics/track periodically.
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Types
interface PageView {
    path: string;
    ts: number;
    referrer?: string;
    duration?: number; // ms spent on page
    scrollDepth?: number; // 0-100%
    exitPage?: boolean;
}

interface ProductView {
    slug: string;
    name: string;
    category: string;
    price: number;
    ts: number;
}

interface UserAction {
    type: 'click' | 'add_cart' | 'buy' | 'search' | 'filter' | 'try_on' | 'share' | 'scroll_deep';
    target: string;
    ts: number;
}

interface DeviceInfo {
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    language: string;
    timezone: string;
    touchScreen: boolean;
    connectionType?: string;
}

interface BehaviorData {
    sessionId: string;
    pageViews: PageView[];
    productViews: ProductView[];
    actions: UserAction[];
    firstVisit: number;
    lastVisit: number;
    visitCount: number;
    entryPage: string;
    device: DeviceInfo | null;
    referrer: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
}

const STORAGE_KEY = 'smk_behavior';
const MAX_ITEMS = 200;

function generateSessionId(): string {
    return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function detectDevice(): DeviceInfo {
    const ua = navigator.userAgent;
    const w = window.screen.width;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (w <= 768 || /Mobi|Android/i.test(ua)) deviceType = 'mobile';
    else if (w <= 1024 || /Tablet|iPad/i.test(ua)) deviceType = 'tablet';

    let os = 'Unknown';
    if (/Win/i.test(ua)) os = 'Windows';
    else if (/Mac/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad/i.test(ua)) os = 'iOS';

    let browser = 'Unknown';
    if (/CriOS|Chrome/i.test(ua) && !/Edge/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Edge/i.test(ua)) browser = 'Edge';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

    let connectionType: string | undefined;
    const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
    if (nav.connection?.effectiveType) connectionType = nav.connection.effectiveType;

    return {
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        deviceType,
        os,
        browser,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        connectionType,
    };
}

function getStoredBehavior(): BehaviorData {
    if (typeof window === 'undefined') {
        return { sessionId: '', pageViews: [], productViews: [], actions: [], firstVisit: 0, lastVisit: 0, visitCount: 0, entryPage: '/', device: null, referrer: '' };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Check session timeout (30 min)
            if (parsed.lastVisit && Date.now() - parsed.lastVisit > 30 * 60 * 1000) {
                // New session
                const now = Date.now();
                return {
                    sessionId: generateSessionId(),
                    pageViews: [],
                    productViews: [],
                    actions: [],
                    firstVisit: now,
                    lastVisit: now,
                    visitCount: (parsed.visitCount || 0) + 1,
                    entryPage: window.location.pathname,
                    device: detectDevice(),
                    referrer: document.referrer || '',
                };
            }
            return parsed;
        }
    } catch { /* ignore */ }
    const now = Date.now();
    const params = new URLSearchParams(window.location.search);
    return {
        sessionId: generateSessionId(),
        pageViews: [],
        productViews: [],
        actions: [],
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        entryPage: window.location.pathname,
        device: detectDevice(),
        referrer: document.referrer || '',
        utmSource: params.get('utm_source') || undefined,
        utmMedium: params.get('utm_medium') || undefined,
        utmCampaign: params.get('utm_campaign') || undefined,
    };
}

function saveBehavior(data: BehaviorData) {
    if (typeof window === 'undefined') return;
    data.pageViews = data.pageViews.slice(-MAX_ITEMS);
    data.productViews = data.productViews.slice(-MAX_ITEMS);
    data.actions = data.actions.slice(-MAX_ITEMS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* quota */ }
}

// Track a page view
export function trackPageView(path: string) {
    const data = getStoredBehavior();
    // Mark previous page's duration
    if (data.pageViews.length > 0) {
        const last = data.pageViews[data.pageViews.length - 1];
        if (!last.duration) last.duration = Date.now() - last.ts;
    }
    data.pageViews.push({ path, ts: Date.now(), referrer: document.referrer || undefined });
    data.lastVisit = Date.now();
    if (!data.device) data.device = detectDevice();
    saveBehavior(data);
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

// Compute session stats
function computeSessionStats(data: BehaviorData) {
    const pagesWithDuration = data.pageViews.filter(p => p.duration && p.duration > 0);
    const avgTimeOnPage = pagesWithDuration.length > 0
        ? Math.round(pagesWithDuration.reduce((s, p) => s + (p.duration || 0), 0) / pagesWithDuration.length)
        : 0;
    const totalSessionTime = data.lastVisit - data.firstVisit;

    // Page flow: sequence of pages visited
    const pageFlow = data.pageViews.slice(-20).map(p => p.path);

    // Bounce: only 1 page viewed and < 10 seconds
    const isBounce = data.pageViews.length <= 1 && totalSessionTime < 10000;

    // Most viewed pages in session
    const pageCounts: Record<string, number> = {};
    for (const pv of data.pageViews) {
        pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
    }

    // Scroll depths
    const scrollDepths = data.pageViews.filter(p => p.scrollDepth !== undefined).map(p => p.scrollDepth!);
    const avgScrollDepth = scrollDepths.length > 0
        ? Math.round(scrollDepths.reduce((s, d) => s + d, 0) / scrollDepths.length)
        : 0;

    return { avgTimeOnPage, totalSessionTime, pageFlow, isBounce, pageCounts, avgScrollDepth };
}

// Send analytics to API
async function sendToApi(data: BehaviorData) {
    try {
        const stats = computeSessionStats(data);
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
                entryPage: data.entryPage,
                lastProducts: data.productViews.slice(-5).map(p => p.slug),
                categories: [...new Set(data.productViews.map(p => p.category))],
                priceRange: data.productViews.length > 0 ? {
                    min: Math.min(...data.productViews.map(p => p.price)),
                    max: Math.max(...data.productViews.map(p => p.price)),
                    avg: data.productViews.reduce((s, p) => s + p.price, 0) / data.productViews.length,
                } : null,
                actions: data.actions.slice(-20),
                // New enhanced data
                device: data.device,
                referrer: data.referrer,
                utmSource: data.utmSource,
                utmMedium: data.utmMedium,
                utmCampaign: data.utmCampaign,
                avgTimeOnPage: stats.avgTimeOnPage,
                totalSessionTime: stats.totalSessionTime,
                avgScrollDepth: stats.avgScrollDepth,
                isBounce: stats.isBounce,
                pageFlow: stats.pageFlow,
                pageCounts: stats.pageCounts,
            }),
        });
    } catch { /* silent */ }
}

// Get dynamic menu suggestions based on behavior
export function getDynamicMenuItems(): { href: string; icon: string; label: string }[] {
    const data = getStoredBehavior();
    const items: { href: string; icon: string; label: string; score: number }[] = [];

    const categoryCounts: Record<string, number> = {};
    const priceBuckets = { budget: 0, mid: 0, premium: 0 };

    for (const pv of data.productViews) {
        categoryCounts[pv.category] = (categoryCounts[pv.category] || 0) + 1;
        if (pv.price < 500000) priceBuckets.budget++;
        else if (pv.price < 1500000) priceBuckets.mid++;
        else priceBuckets.premium++;
    }

    const pagePatterns: Record<string, number> = {};
    for (const pv of data.pageViews) {
        const key = pv.path.split('?')[0];
        pagePatterns[key] = (pagePatterns[key] || 0) + 1;
    }

    const POTENTIAL_ITEMS = [
        { href: '/search?category=kinh-mat', icon: '', label: 'Kính mắt', cat: 'kinh-mat' },
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
        if (categoryCounts[item.cat]) score += categoryCounts[item.cat] * 10;
        if (item.cat === 'budget' && priceBuckets.budget > 2) score += 15;
        if (item.cat === 'premium' && priceBuckets.premium > 2) score += 15;
        if (pagePatterns[item.href.split('?')[0]]) score += pagePatterns[item.href.split('?')[0]] * 5;
        if ((item.cat === 'wishlist' || item.cat === 'orders') && pagePatterns['/account']) score += 10;
        if (item.cat === 'track' && data.actions.some(a => a.type === 'buy')) score += 20;
        if (item.cat === 'sale') score += 8;
        if (item.cat === 'hot') score += 7;
        items.push({ ...item, score });
    }

    return items.sort((a, b) => b.score - a.score).slice(0, 5).map(({ href, icon, label }) => ({ href, icon, label }));
}

// Auto-track component — place in layout
export default function BehaviorTracker() {
    const pathname = usePathname();
    const scrollDepthRef = useRef(0);
    const pageStartRef = useRef(Date.now());

    const track = useCallback(() => {
        // Save previous page's scroll depth + duration
        if (typeof window !== 'undefined') {
            const data = getStoredBehavior();
            if (data.pageViews.length > 0) {
                const last = data.pageViews[data.pageViews.length - 1];
                last.scrollDepth = scrollDepthRef.current;
                last.duration = Date.now() - pageStartRef.current;
                saveBehavior(data);
            }
        }
        // Reset for new page
        scrollDepthRef.current = 0;
        pageStartRef.current = Date.now();
        trackPageView(pathname);
    }, [pathname]);

    useEffect(() => {
        track();
    }, [track]);

    // Scroll depth tracking
    useEffect(() => {
        const handler = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                const depth = Math.round((scrollTop / docHeight) * 100);
                if (depth > scrollDepthRef.current) {
                    // Bug #24: Track deep scroll when first crossing 75%
                    if (depth >= 75 && scrollDepthRef.current < 75) {
                        trackAction('scroll_deep', pathname);
                    }
                    scrollDepthRef.current = depth;
                }
            }
        };
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, [pathname]);

    // Track clicks on product links + other actions
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
            if (buyBtn) trackAction('buy', pathname);
            const tryOnBtn = target.closest('[href*="try-on"], [class*="try-on"]');
            if (tryOnBtn) trackAction('try_on', pathname);
            const shareBtn = target.closest('[class*="share"], [aria-label*="share"]');
            if (shareBtn) trackAction('share', pathname);
        };
        document.addEventListener('click', handler);
        return () => document.removeEventListener('click', handler);
    }, [pathname]);

    // Send final data on page exit
    useEffect(() => {
        const handleBeforeUnload = () => {
            const data = getStoredBehavior();
            if (data.pageViews.length > 0) {
                const last = data.pageViews[data.pageViews.length - 1];
                last.scrollDepth = scrollDepthRef.current;
                last.duration = Date.now() - pageStartRef.current;
                last.exitPage = true;
                saveBehavior(data);
                // Use sendBeacon for reliable exit tracking
                const stats = computeSessionStats(data);
                navigator.sendBeacon('/api/analytics/track', JSON.stringify({
                    sessionId: data.sessionId,
                    pageCount: data.pageViews.length,
                    productViewCount: data.productViews.length,
                    actionCount: data.actions.length,
                    visitCount: data.visitCount,
                    currentPath: last.path,
                    entryPage: data.entryPage,
                    exitPage: last.path,
                    device: data.device,
                    referrer: data.referrer,
                    avgTimeOnPage: stats.avgTimeOnPage,
                    totalSessionTime: stats.totalSessionTime,
                    avgScrollDepth: stats.avgScrollDepth,
                    isBounce: stats.isBounce,
                    lastProducts: data.productViews.slice(-5).map(p => p.slug),
                    categories: [...new Set(data.productViews.map(p => p.category))],
                    actions: data.actions.slice(-20),
                }));
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    return null;
}
