import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/partner/dashboard', '/partner/wallet', '/partner/analytics'],
            },
        ],
        sitemap: 'https://sieuthimatkinh.vn/sitemap.xml',
    };
}
