import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getCustomerSessionFromRequest } from '@/lib/auth';

// POST /api/partner/apply — partner registration
export async function POST(req: NextRequest) {
    // Bug #22: Verify logged-in user
    const session = getCustomerSessionFromRequest(req);
    if (!session?.userId) {
        return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }

    const body = await req.json();
    const { partnerCode, level, bankAccount, bio, storeName, channels } = body;
    const userId = session.userId; // Use session userId, not body

    if (!partnerCode) {
        return NextResponse.json({ error: 'Mã đối tác là bắt buộc' }, { status: 400 });
    }

    // Validate code format
    if (!/^[A-Z0-9_]{3,15}$/i.test(partnerCode)) {
        return NextResponse.json({ error: 'Mã đối tác phải từ 3-15 ký tự (chữ, số, _)' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await db.partnerProfile.findUnique({ where: { partnerCode: partnerCode.toUpperCase() } });
    if (existing) return NextResponse.json({ error: 'Mã đối tác đã tồn tại' }, { status: 409 });

    const profile = await db.partnerProfile.create({
        data: {
            userId,
            partnerCode: partnerCode.toUpperCase(),
            level: level === 'AGENT' ? 'AGENT' : 'AFFILIATE',
            bankAccount: bankAccount || null,
            bio,
            storeName,
        },
    });

    // Update user role
    await db.user.update({ where: { id: userId }, data: { role: 'PARTNER' } });

    // Log event
    await db.eventLog.create({
        data: { type: 'PARTNER_REGISTERED', userId, partnerId: profile.id, payload: { partnerCode, level, channels } },
    });

    return NextResponse.json({ profile }, { status: 201 });
}
