import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/orders/:id — single order detail with timeline
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const order = await db.order.findFirst({
        where: { id, userId },
        include: {
            items: {
                include: {
                    variant: {
                        select: { frameColor: true, lensColor: true, sku: true },
                        include: { product: { select: { name: true, slug: true } } } as never,
                    },
                },
            },
            statusHistory: { orderBy: { createdAt: 'desc' } },
            coupon: { select: { code: true, type: true, value: true } },
            referral: { select: { attributionType: true, partner: { select: { partnerCode: true } } } },
        },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({ order });
}
