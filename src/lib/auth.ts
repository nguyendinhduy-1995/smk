import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ─── Constants ─────────────────────────────────────
// S1: Lazy secret getter — validates at runtime, not at import/build time
function getSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
        console.error('JWT_SECRET not set in production!');
    }
    return secret || 'smk-dev-only-secret';
}
const COOKIE_NAME = 'smk_admin_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const ADMIN_ROLES = ['ADMIN', 'STORE_MANAGER', 'STAFF'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ALL_PERMISSIONS = [
    'dashboard', 'products', 'orders', 'customers', 'partners',
    'commissions', 'payouts', 'automation', 'ai', 'analytics', 'fraud', 'users',
] as const;
export type Permission = (typeof ALL_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<string, string> = {
    dashboard: 'Tổng quan',
    products: 'Sản phẩm',
    orders: 'Đơn hàng',
    customers: 'Khách hàng',
    partners: 'Đại lý/Aff',
    commissions: 'Hoa hồng',
    payouts: 'Chi trả',
    automation: 'Tự động hoá',
    ai: 'AI & KB',
    analytics: 'Phân tích',
    fraud: 'Chống gian lận',
    users: 'Quản lý users',
};

export interface AdminSession {
    userId: string;
    email: string;
    name: string;
    role: AdminRole;
    permissions: Permission[];
}

// ─── Simple JWT (base64 HMAC) ──────────────────────
function base64url(str: string): string {
    return Buffer.from(str).toString('base64url');
}

function sign(payload: object, maxAgeSec?: number): string {
    const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const expiry = maxAgeSec || COOKIE_MAX_AGE;
    const body = base64url(JSON.stringify({ ...payload, exp: Date.now() + expiry * 1000 }));
    const sig = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${sig}`;
}

function verify(token: string): AdminSession | null {
    try {
        const [header, body, sig] = token.split('.');
        const expectedSig = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
        if (sig !== expectedSig) return null;
        const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
        if (payload.exp < Date.now()) return null;
        return {
            userId: payload.userId,
            email: payload.email,
            name: payload.name,
            role: payload.role,
            permissions: payload.permissions || [],
        };
    } catch {
        return null;
    }
}

// ─── Public API ────────────────────────────────────

/** Create a signed session token */
export function createSessionToken(session: AdminSession): string {
    return sign(session);
}

/** Get session cookie options */
export function getSessionCookieOptions() {
    return {
        name: COOKIE_NAME,
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    };
}

/** Read session from cookies (server component / API route) */
export async function getSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verify(token);
}

/** Read session from request (middleware / API route) */
export function getSessionFromRequest(request: NextRequest): AdminSession | null {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verify(token);
}

/** Check if user has a specific permission */
export function hasPermission(session: AdminSession | null, permission: Permission): boolean {
    if (!session) return false;
    if (session.role === 'ADMIN') return true;
    if (session.role === 'STORE_MANAGER') return permission !== 'users';
    // STAFF — check explicit permissions
    return session.permissions.includes(permission);
}

/** Quick guard for admin API routes — returns NextResponse 401 or null if OK */
export function requireAdmin(req: NextRequest, permission: Permission): NextResponse | null {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session, permission)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return null;
}

/** Get allowed permissions for a role */
export function getEffectivePermissions(role: AdminRole, permissions?: Permission[]): Permission[] {
    if (role === 'ADMIN') return [...ALL_PERMISSIONS];
    if (role === 'STORE_MANAGER') return ALL_PERMISSIONS.filter(p => p !== 'users');
    return permissions || [];
}

export { COOKIE_NAME };

// ─── Customer Auth ─────────────────────────────────
const CUSTOMER_COOKIE_NAME = 'smk_customer_session';
const CUSTOMER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface CustomerSession {
    userId: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
}

export function createCustomerToken(session: CustomerSession): string {
    return sign(session, CUSTOMER_COOKIE_MAX_AGE);
}

export function getCustomerCookieOptions() {
    return {
        name: CUSTOMER_COOKIE_NAME,
        maxAge: CUSTOMER_COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
    };
}

function toCustomerSession(payload: AdminSession): CustomerSession {
    const p = payload as unknown as Record<string, string>;
    return {
        userId: p.userId || payload.userId,
        name: p.name || payload.name,
        phone: p.phone || '',
        email: p.email || null,
        role: p.role || 'CUSTOMER',
    };
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verify(token);
    if (!payload) return null;
    return toCustomerSession(payload);
}

export function getCustomerSessionFromRequest(request: NextRequest): CustomerSession | null {
    const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = verify(token);
    if (!payload) return null;
    return toCustomerSession(payload);
}

export { CUSTOMER_COOKIE_NAME };
