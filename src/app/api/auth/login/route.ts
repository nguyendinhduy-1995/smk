import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createCustomerToken, getCustomerCookieOptions } from '@/lib/auth';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    // Bug #6: Rate limit login attempts
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = rateLimit(ip);
    if (!rl.allowed) return rateLimitResponse();

    try {
        const { phone, password } = await request.json();

        if (!phone || !password) {
            return NextResponse.json({ error: 'Vui lòng nhập SĐT và mật khẩu' }, { status: 400 });
        }

        // Bug #10: Handle +84 prefix correctly
        const normalizedPhone = phone.replace(/\s/g, '').replace(/^\+?84/, '0');


        const user = await db.user.findUnique({ where: { phone: normalizedPhone } });
        if (!user || !user.password) {
            return NextResponse.json({ error: 'SĐT hoặc mật khẩu không đúng' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'SĐT hoặc mật khẩu không đúng' }, { status: 401 });
        }

        const token = createCustomerToken({
            userId: user.id,
            name: user.name || '',
            phone: normalizedPhone,
            email: user.email,
            role: user.role,
        });

        const cookieOpts = getCustomerCookieOptions();
        const response = NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, phone: normalizedPhone, email: user.email },
        });

        response.cookies.set(cookieOpts.name, token, {
            maxAge: cookieOpts.maxAge,
            httpOnly: cookieOpts.httpOnly,
            sameSite: cookieOpts.sameSite,
            path: cookieOpts.path,
            secure: cookieOpts.secure,
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Lỗi server, vui lòng thử lại' }, { status: 500 });
    }
}
