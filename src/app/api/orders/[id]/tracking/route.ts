import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/orders/[id]/tracking — order tracking timeline
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = req.headers.get('x-user-id');

    const order = await db.order.findFirst({
        where: { OR: [{ id }, { code: id }], ...(userId ? { userId } : {}) },
        include: {
            items: {
                include: { variant: { include: { product: { select: { name: true, slug: true } } } } },
            },
            statusHistory: { orderBy: { createdAt: 'asc' } },
            user: { select: { name: true } },
        },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Build timeline
    const TIMELINE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
        CREATED: { label: 'Đã đặt hàng', icon: '📝', desc: 'Đơn hàng đã được tạo thành công' },
        CONFIRMED: { label: 'Xác nhận', icon: '✅', desc: 'Đơn hàng đã được xác nhận bởi cửa hàng' },
        PAID: { label: 'Đã thanh toán', icon: '💳', desc: 'Thanh toán đã được xử lý' },
        SHIPPING: { label: 'Đang giao hàng', icon: '🚚', desc: 'Đơn hàng đang trên đường đến bạn' },
        DELIVERED: { label: 'Đã giao hàng', icon: '📦', desc: 'Đơn hàng đã được giao thành công' },
        RETURNED: { label: 'Hoàn trả', icon: '🔄', desc: 'Đơn hàng đã được hoàn trả' },
        CANCELLED: { label: 'Đã huỷ', icon: '❌', desc: 'Đơn hàng đã bị huỷ' },
    };

    const timeline = order.statusHistory.map((h) => ({
        status: h.status,
        label: TIMELINE_LABELS[h.status]?.label || h.status,
        icon: TIMELINE_LABELS[h.status]?.icon || '⏳',
        description: h.note || TIMELINE_LABELS[h.status]?.desc || '',
        createdAt: h.createdAt,
    }));

    return NextResponse.json({
        order: {
            code: order.code,
            status: order.status,
            total: order.total,
            subtotal: order.subtotal,
            discountTotal: order.discountTotal,
            shippingFee: order.shippingFee,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            trackingNumber: order.trackingNumber,
            trackingUrl: order.trackingUrl,
            shippingAddress: order.shippingAddress,
            note: order.note,
            createdAt: order.createdAt,
            items: order.items.map((i) => ({
                name: i.nameSnapshot,
                qty: i.qty,
                price: i.price,
                slug: i.variant.product.slug,
            })),
        },
        timeline,
    });
}
