// ─── Feature Flag Keys & Configuration ────────────────────
// Each advanced feature can be toggled independently

export const FEATURE_KEYS = {
    ADV_SHIPPING: 'ADV_SHIPPING',
    ADV_WAREHOUSE: 'ADV_WAREHOUSE',
    ADV_PARTNER: 'ADV_PARTNER',
    ADV_RETURNS: 'ADV_RETURNS',
    ADV_REVIEWS: 'ADV_REVIEWS',
    ADV_AI: 'ADV_AI',
    ADV_ANALYTICS: 'ADV_ANALYTICS',
    ADV_AUTOMATION: 'ADV_AUTOMATION',
    ADV_TRYON: 'ADV_TRYON',
    ADV_LOYALTY: 'ADV_LOYALTY',
    ADV_PRESCRIPTION: 'ADV_PRESCRIPTION',
    ADV_SEO: 'ADV_SEO',
    ADV_SUPPORT: 'ADV_SUPPORT',
    ADV_SHOP_EXTRAS: 'ADV_SHOP_EXTRAS',
} as const;

export type FeatureKey = keyof typeof FEATURE_KEYS;

// Feature metadata for display
export const FEATURE_META: Record<FeatureKey, { label: string; icon: string; desc: string }> = {
    ADV_SHIPPING: { label: 'Multi-carrier Shipping', icon: '🚚', desc: 'GHN, GHTK, ViettelPost, J&T, NinjaVan' },
    ADV_WAREHOUSE: { label: 'Kho hàng & Kiểm kê', icon: '🏭', desc: 'Multi-warehouse, vouchers, stocktake' },
    ADV_PARTNER: { label: 'Affiliate / Đối tác', icon: '🤝', desc: 'Partner portal, commission, payouts' },
    ADV_RETURNS: { label: 'Đổi trả / Bảo hành', icon: '↩️', desc: 'RMA, warranty, exchange flow' },
    ADV_REVIEWS: { label: 'Đánh giá & Q&A', icon: '⭐', desc: 'Reviews, questions, spam detection' },
    ADV_AI: { label: 'AI Content', icon: '🤖', desc: 'AI content generation for products' },
    ADV_ANALYTICS: { label: 'Advanced Analytics', icon: '📈', desc: 'Revenue, cohorts, funnels' },
    ADV_AUTOMATION: { label: 'Marketing Automation', icon: '⚡', desc: 'Triggers, scheduled tasks' },
    ADV_TRYON: { label: 'Virtual Try-on (AR)', icon: '👓', desc: 'AR try-on with camera' },
    ADV_LOYALTY: { label: 'Loyalty & Points', icon: '🎁', desc: 'Points, rewards, tiers' },
    ADV_PRESCRIPTION: { label: 'Đơn thuốc mắt', icon: '📋', desc: 'Prescription management' },
    ADV_SEO: { label: 'SEO Tools', icon: '🔍', desc: 'Meta editor, sitemap, structured data' },
    ADV_SUPPORT: { label: 'Customer Support', icon: '🎧', desc: 'Tickets, live chat' },
    ADV_SHOP_EXTRAS: { label: 'Shop Extras', icon: '🛍️', desc: 'Wishlist, compare, quiz, blog, booking' },
};

// Map admin routes to required feature keys
export const ROUTE_FEATURE_MAP: Record<string, FeatureKey> = {
    '/admin/shipping': 'ADV_SHIPPING',
    '/admin/warehouse': 'ADV_WAREHOUSE',
    '/admin/partners': 'ADV_PARTNER',
    '/admin/commissions': 'ADV_PARTNER',
    '/admin/payouts': 'ADV_PARTNER',
    '/admin/fraud': 'ADV_PARTNER',
    '/admin/returns': 'ADV_RETURNS',
    '/admin/reviews': 'ADV_REVIEWS',
    '/admin/ai': 'ADV_AI',
    '/admin/analytics': 'ADV_ANALYTICS',
    '/admin/automation': 'ADV_AUTOMATION',
    '/admin/prescription': 'ADV_PRESCRIPTION',
    '/admin/seo': 'ADV_SEO',
    '/admin/support': 'ADV_SUPPORT',
};

// Tenant entitlement config
export interface TenantFeatures {
    enabledFeatures: FeatureKey[];
    limits?: Record<string, number>; // e.g. { ai_credits: 100 }
}

// Default: ALL features ON (for backward compatibility / development)
const DEFAULT_FEATURES: TenantFeatures = {
    enabledFeatures: Object.keys(FEATURE_KEYS) as FeatureKey[],
};

// In-memory cache (per deployment instance)
let _cachedFeatures: TenantFeatures | null = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get feature config for the current tenant.
 * Sources (in priority order):
 * 1. Environment variable SMK_FEATURES (comma-separated keys)
 * 2. Hub entitlement API (future)
 * 3. Default: all ON
 */
export function getTenantFeatures(): TenantFeatures {
    // Check cache
    if (_cachedFeatures && Date.now() < _cacheExpiry) {
        return _cachedFeatures;
    }

    // Source 1: Environment variable
    const envFeatures = process.env.SMK_FEATURES;
    if (envFeatures) {
        if (envFeatures === 'ALL') {
            _cachedFeatures = DEFAULT_FEATURES;
        } else if (envFeatures === 'NONE') {
            _cachedFeatures = { enabledFeatures: [] };
        } else {
            const keys = envFeatures.split(',').map(k => k.trim()).filter(k => k in FEATURE_KEYS) as FeatureKey[];
            _cachedFeatures = { enabledFeatures: keys };
        }
        _cacheExpiry = Date.now() + CACHE_TTL_MS;
        return _cachedFeatures;
    }

    // Default: all features ON
    _cachedFeatures = DEFAULT_FEATURES;
    _cacheExpiry = Date.now() + CACHE_TTL_MS;
    return _cachedFeatures;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(key: FeatureKey): boolean {
    const features = getTenantFeatures();
    return features.enabledFeatures.includes(key);
}

/**
 * Check if the feature required for a route is enabled
 */
export function isRouteEnabled(path: string): boolean {
    const featureKey = ROUTE_FEATURE_MAP[path];
    if (!featureKey) return true; // core routes always enabled
    return isFeatureEnabled(featureKey);
}

/**
 * Reset feature cache (e.g. after entitlement update)
 */
export function resetFeatureCache() {
    _cachedFeatures = null;
    _cacheExpiry = 0;
}
