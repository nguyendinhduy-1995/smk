import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';

// Auto-payout: tự động chi trả khi HH ≥ 200K cuối tuần
// Bug #23: Require admin auth
export async function POST(req: NextRequest) {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session, 'payouts')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // TODO: Implement actual auto-payout logic
        // 1. Query partners with pending commission >= 200,000 VND
        // 2. Create payout requests automatically
        // 3. Process via bank transfer API
        return NextResponse.json({
            success: true,
            processed: 0,
            totalAmount: 0,
            threshold: 200000,
            message: 'Chức năng chi trả tự động chưa được kích hoạt',
        });
    } catch {
        return NextResponse.json({ error: 'Lỗi xử lý chi trả tự động' }, { status: 500 });
    }
}

// GET: check pending payouts
export async function GET(req: NextRequest) {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session, 'payouts')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
        pendingCount: 0,
        totalPending: 0,
        threshold: 200000,
        nextAutoRun: 'Chưa kích hoạt',
        partners: [],
    });
}

