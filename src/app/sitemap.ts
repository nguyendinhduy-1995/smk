import type { MetadataRoute } from 'next';

const BASE_URL = 'https://sieuthimatkinh.vn';

// Demo product slugs — in production, fetch from DB
const PRODUCT_SLUGS = [
    'aviator-classic-gold',
    'cat-eye-acetate-tortoise',
    'round-titanium-silver',
    'square-tr90-black',
    'browline-mixed-gold-black',
    'oval-acetate-crystal-pink',
    'geometric-titanium-rose',
    'rectangle-metal-gunmetal',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/try-on`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/support`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/faq`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${BASE_URL}/cart`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
        { url: `${BASE_URL}/partner`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${BASE_URL}/track`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    ];

    const productPages: MetadataRoute.Sitemap = PRODUCT_SLUGS.map((slug) => ({
        url: `${BASE_URL}/p/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...productPages];
}
