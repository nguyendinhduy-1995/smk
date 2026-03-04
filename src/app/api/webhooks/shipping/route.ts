import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/webhooks/shipping — handle shipping carrier callbacks (GHN, GHTK, etc.)
export async function POST(req: NextRequest) {
    // Bug #26: Webhook secret REQUIRED — reject if not configured
    const WEBHOOK_SECRET = process.env.WEBHOOK_SHIPPING_SECRET;
    if (!WEBHOOK_SECRET) {
        console.error('[Webhook] WEBHOOK_SHIPPING_SECRET not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }
    const reqSecret = req.headers.get('x-webhook-secret');
    if (reqSecret !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 403 });
    }

    const body = await req.json();

    const orderCode = body.orderCode || body.order_code || body.ClientOrderCode;
    const shippingStatus = body.Status || body.status;
    const trackingNumber = body.OrderCode || body.tracking_id;

    if (!orderCode) {
        return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
    }

    const order = await db.order.findFirst({
        where: { OR: [{ code: orderCode }, { id: orderCode }] },
    });

    if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Map shipping carrier statuses to our status
    let newStatus: string | null = null;
    const statusLower = String(shippingStatus).toLowerCase();

    if (['delivering', 'transporting', 'picked'].includes(statusLower)) {
        newStatus = 'SHIPPING';
    } else if (['delivered', 'finish', 'completed'].includes(statusLower)) {
        newStatus = 'DELIVERED';
    } else if (['return', 'returned', 'cancel'].includes(statusLower)) {
        newStatus = 'RETURNED';
    }

    const updateData: Record<string, unknown> = {};
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (newStatus) updateData.status = newStatus;

    if (Object.keys(updateData).length > 0) {
        // Bug #28: Validate FSM transition before updating
        const VALID_TRANSITIONS: Record<string, string[]> = {
            CREATED: ['SHIPPING'], PAID: ['SHIPPING'], PROCESSING: ['SHIPPING'],
            SHIPPING: ['DELIVERED', 'RETURNED'], DELIVERED: ['RETURNED'],
        };
        if (newStatus) {
            const allowed = VALID_TRANSITIONS[order.status] || [];
            if (!allowed.includes(newStatus)) {
                return NextResponse.json({ ok: true, status: 'invalid_transition', from: order.status, to: newStatus });
            }
        }

        await db.order.update({
            where: { id: order.id },
            data: updateData,
        });

        if (newStatus) {
            await db.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    status: newStatus as 'SHIPPING' | 'DELIVERED' | 'RETURNED',
                    note: `Cập nhật từ đơn vị vận chuyển: ${shippingStatus}`,
                },
            });

            // Log events
            const eventType = newStatus === 'DELIVERED' ? 'ORDER_DELIVERED'
                : newStatus === 'RETURNED' ? 'ORDER_RETURNED'
                    : 'ORDER_SHIPPED';

            await db.eventLog.create({
                data: {
                    type: eventType,
                    orderId: order.id,
                    userId: order.userId,
                    payload: body,
                },
            });
        }
    }

    return NextResponse.json({ ok: true, status: newStatus || 'no_change' });
}
