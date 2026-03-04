'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const AIStylistChat = dynamic(() => import('@/components/AIStylistChat'), { ssr: false });
const MetaPixel = dynamic(() => import('@/components/MetaPixel'), { ssr: false });

/**
 * Renders shop-only widgets (AIStylistChat, MetaPixel).
 * Excluded from /admin and /partner routes.
 */
export default function ConditionalWidgets() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const isPartner = pathname?.startsWith('/partner');

    if (isAdmin || isPartner) return null;

    return (
        <>
            <MetaPixel />
            <AIStylistChat />
        </>
    );
}
