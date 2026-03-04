import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'smk_admin_session';

// Map admin routes to required permissions
const ROUTE_PERMISSIONS: Record<string, string> = {
    '/admin/products': 'products',
    '/admin/prescription': 'products',
    '/admin/warehouse': 'products',
    '/admin/reviews': 'products',
    '/admin/orders': 'orders',
    '/admin/shipping': 'orders',
    '/admin/returns': 'orders',
    '/admin/customers': 'customers',
    '/admin/support': 'customers',
    '/admin/partners': 'partners',
    '/admin/commissions': 'commissions',
    '/admin/payouts': 'payouts',
    '/admin/fraud': 'fraud',
    '/admin/automation': 'automation',
    '/admin/ai': 'ai',
    '/admin/analytics': 'analytics',
    '/admin/meta-pixel': 'analytics',
    '/admin/seo': 'analytics',
    '/admin/audit': 'users',
    '/admin/users': 'users',
};

interface TokenPayload {
    role?: string;
    permissions?: string[];
    exp?: number;
}

/** Decode JWT payload (Edge-compatible) */
function decodeToken(token: string): TokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
        const payload = JSON.parse(atob(padded));
        if (payload.exp && payload.exp < Date.now()) return null;
        return payload;
    } catch {
        return null;
    }
}

/** Check if user has permission for a route */
function canAccess(payload: TokenPayload, permission: string): boolean {
    if (!payload.role) return false;
    if (payload.role === 'ADMIN') return true;
    if (payload.role === 'STORE_MANAGER') return permission !== 'users';
    // STAFF — check explicit permissions
    return (payload.permissions || []).includes(permission);
}

export function middleware(request: NextRequest) {
    const { searchParams, pathname } = request.nextUrl;
    const refCode = searchParams.get('ref');

    // Skip for API routes, static files, and internal Next.js routes
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
        return NextResponse.next();
    }

    const response = NextResponse.next();

    // ─── Admin Route Protection ─────────────────────────
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        const payload = token ? decodeToken(token) : null;

        if (!payload) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Check per-route permissions
        const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(
            route => pathname === route || pathname.startsWith(route + '/')
        );

        if (matchedRoute) {
            const requiredPerm = ROUTE_PERMISSIONS[matchedRoute];
            if (!canAccess(payload, requiredPerm)) {
                // Redirect to dashboard with error
                const dashUrl = new URL('/admin', request.url);
                dashUrl.searchParams.set('error', 'no_permission');
                return NextResponse.redirect(dashUrl);
            }
        }
    }

    // If on admin login and already logged in, redirect to dashboard
    if (pathname === '/admin/login') {
        const token = request.cookies.get(COOKIE_NAME)?.value;
        if (token && decodeToken(token)) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // ─── F7 — Auto-track ref links: ?ref=PARTNER_CODE ──
    if (refCode) {
        response.cookies.set('smk_ref', refCode.toUpperCase(), {
            maxAge: 7 * 24 * 60 * 60,
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        });

        const existingSessionId = request.cookies.get('smk_session')?.value;
        if (!existingSessionId) {
            const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            response.cookies.set('smk_session', sessionId, {
                maxAge: 30 * 24 * 60 * 60,
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
            });
        }

        const cleanUrl = request.nextUrl.clone();
        cleanUrl.searchParams.delete('ref');
        if (cleanUrl.searchParams.toString() === '') {
            return NextResponse.redirect(new URL(cleanUrl.pathname, request.url), {
                headers: response.headers,
            });
        }
        return NextResponse.redirect(cleanUrl, { headers: response.headers });
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
