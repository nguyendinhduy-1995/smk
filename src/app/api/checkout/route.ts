import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// POST /api/checkout — create order
export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        userId,
        items,
        shippingAddress,
        paymentMethod,
        couponCode,
        note,
    } = body as {
        userId: string;
        items: { variantId: string; qty: number }[];
        shippingAddress: Record<string, string>;
        paymentMethod: string;
        couponCode?: string;
        note?: string;
    };

    if (!userId || !items?.length || !shippingAddress || !paymentMethod) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1) Validate variants + snapshot prices
    const variantIds = items.map((i) => i.variantId);
    const variants = await db.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        include: { product: { select: { name: true } } },
    });

    if (variants.length !== items.length) {
        return NextResponse.json({ error: 'Invalid or inactive product variants' }, { status: 400 });
    }

    // Stock check moved inside transaction (L8 fix)

    // 2) Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item) => {
        const v = variants.find((v) => v.id === item.variantId)!;
        const lineTotal = v.price * item.qty;
        subtotal += lineTotal;
        return {
            variantId: v.id,
            qty: item.qty,
            price: v.price,
            nameSnapshot: v.product.name,
            skuSnapshot: v.sku,
        };
    });

    // 3) Coupon discount
    let discountTotal = 0;
    let couponId: string | null = null;
    let attributionPartnerId: string | null = null;

    if (couponCode) {
        const coupon = await db.coupon.findUnique({ where: { code: couponCode } });
        if (!coupon) {
            return NextResponse.json({ error: 'Mã giảm giá không tồn tại' }, { status: 400 });
        }
        const now2 = new Date();
        if (!coupon.isActive || now2 < coupon.startsAt || now2 > coupon.endsAt) {
            return NextResponse.json({ error: 'Mã giảm giá đã hết hạn' }, { status: 400 });
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json({ error: 'Mã giảm giá đã hết lượt sử dụng' }, { status: 400 });
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return NextResponse.json({ error: `Đơn tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}₫` }, { status: 400 });
        }
        discountTotal =
            coupon.type === 'PERCENT'
                ? Math.round((subtotal * coupon.value) / 100)
                : coupon.value;
        discountTotal = Math.min(discountTotal, subtotal);
        couponId = coupon.id;

        // Attribution via coupon
        if (coupon.ownerPartnerId) {
            attributionPartnerId = coupon.ownerPartnerId;
        }
        // L5: usageCount increment moved into transaction below
    }

    const shippingFee = subtotal - discountTotal >= 500000 ? 0 : 30000;
    const total = subtotal - discountTotal + shippingFee;

    // 4) Check for attribution session (last-click if no coupon attribution)
    if (!attributionPartnerId) {
        const attribution = await db.attributionSession.findFirst({
            where: { userId, expiresAt: { gte: new Date() } },
            orderBy: { lastTouch: 'desc' },
        });
        if (attribution) {
            attributionPartnerId = attribution.partnerId;
        }
    }

    // 5) Generate order code (race-safe: timestamp + random suffix)
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const ms = String(now.getTime() % 100000).padStart(5, '0');
    const orderCode = `SMK-${dateStr}-${ms}${rand}`;

    // 6) Create order in transaction
    const order = await db.$transaction(async (tx) => {
        // L8: Re-check stock inside transaction (atomic)
        for (const item of items) {
            const v = await tx.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: { select: { name: true } } },
            });
            if (!v || v.stockQty - v.reservedQty < item.qty) {
                throw new Error(`NOT_ENOUGH_STOCK:${v?.product?.name || item.variantId}`);
            }
        }

        const order = await tx.order.create({
            data: {
                code: orderCode,
                userId,
                subtotal,
                discountTotal,
                shippingFee,
                total,
                shippingAddress,
                paymentMethod: paymentMethod as 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'ZALOPAY',
                couponId,
                note,
                items: { create: orderItems },
                statusHistory: { create: { status: 'CREATED' } },
            },
            include: { items: true },
        });

        // Reserve stock
        for (const item of items) {
            await tx.productVariant.update({
                where: { id: item.variantId },
                data: { reservedQty: { increment: item.qty } },
            });
        }

        // L5: Increment coupon usage inside transaction
        if (couponId) {
            await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
        }

        // Create referral if attributed
        if (attributionPartnerId) {
            await tx.orderReferral.create({
                data: {
                    orderId: order.id,
                    partnerId: attributionPartnerId,
                    attributionType: couponId ? 'COUPON' : 'LAST_CLICK',
                },
            });
        }

        // Log event
        await tx.eventLog.create({
            data: {
                type: 'PURCHASE',
                userId,
                orderId: order.id,
                payload: { total, paymentMethod, couponCode: couponCode || null },
            },
        });

        return order;
    });

    return NextResponse.json({ order }, { status: 201 });
}
