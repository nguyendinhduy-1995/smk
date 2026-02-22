import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'smk_admin_session';

/** Lightweight session check for Edge middleware — just checks cookie exists and has valid JWT structure */
function hasValidSession(request: NextRequest): boolean {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        // Decode payload and check expiry (atob works in Edge)
        // P4: Proper base64url decode with padding
        const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
        const payload = JSON.parse(atob(padded));
        if (payload.exp && payload.exp < Date.now()) return false;
        return true;
    } catch {
        return false;
    }
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
        if (!hasValidSession(request)) {
            const loginUrl = new URL('/admin/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If on admin login and already logged in, redirect to dashboard
    if (pathname === '/admin/login') {
        if (hasValidSession(request)) {
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
