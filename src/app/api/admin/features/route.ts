import { NextResponse } from 'next/server';
import { getTenantFeatures, FEATURE_KEYS, FEATURE_META, type FeatureKey } from '@/lib/features/flags';

// GET /api/admin/features — returns enabled features for current tenant
export async function GET() {
    const config = getTenantFeatures();

    const allFeatures = Object.keys(FEATURE_KEYS).map(key => {
        const k = key as FeatureKey;
        const meta = FEATURE_META[k];
        return {
            key: k,
            label: meta.label,
            icon: meta.icon,
            desc: meta.desc,
            enabled: config.enabledFeatures.includes(k),
        };
    });

    return NextResponse.json({
        features: config.enabledFeatures,
        limits: config.limits || {},
        all: allFeatures,
    });
}
