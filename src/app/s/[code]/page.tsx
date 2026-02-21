import { redirect } from 'next/navigation';

interface Props {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

// Smart Link redirect: /s/DUY123 → /partner/store/DUY123?ref=smartlink
// Tracks click + redirects to partner's mini-store
export default async function SmartLinkRedirect({ params, searchParams }: Props) {
    const { code } = await params;
    const sp = await searchParams;
    const partnerCode = code.toUpperCase();

    // In production: log click to DB
    // await db.smartLinkClick.create({ data: { partnerCode, userAgent, ip, referer } });

    // Build redirect URL with tracking
    const target = `/partner/store/${partnerCode}?ref=smartlink${sp.utm_source ? `&utm_source=${sp.utm_source}` : ''}`;

    redirect(target);
}
