import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getCustomerSessionFromRequest } from "@/lib/auth";

// POST /api/checkout — create order (supports guest checkout)
export async function POST(req: NextRequest) {
    // Try to get userId from session (logged-in user)
    let userId = getCustomerSessionFromRequest(req)?.userId || null;

    const body = await req.json();
    const {
        items,
        shippingAddress,
        paymentMethod,
        couponCode,
        note,
        // Guest checkout fields
        name,
        phone,
        email,
        address,
        province,
        district,
        ward,
        shipping,
        payment,
    } = body as {
        items: { variantId: string; qty: number }[];
        shippingAddress?: Record<string, string>;
        paymentMethod?: string;
        couponCode?: string;
        note?: string;
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        province?: string;
        district?: string;
        ward?: string;
        shipping?: string;
        payment?: string;
    };

    // Build shipping address from either old format or new flat fields
    const finalShippingAddress = shippingAddress || {
        name: name || "",
        phone: phone || "",
        email: email || "",
        address: address || "",
        province: province || "",
        district: district || "",
        ward: ward || "",
    };
    const finalPaymentMethod = paymentMethod || payment || "COD";

    // Validate required fields
    if (!items?.length) {
        return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }

    // Bug #7: Validate item quantities
    for (const item of items) {
        if (!item.variantId || !item.qty || item.qty <= 0 || item.qty > 100 || !Number.isInteger(item.qty)) {
            return NextResponse.json({ error: "Số lượng sản phẩm không hợp lệ (1-100, số nguyên)" }, { status: 400 });
        }
    }

    const guestName = (finalShippingAddress as Record<string, string>).name || name || "";
    const guestPhone = (finalShippingAddress as Record<string, string>).phone || phone || "";
    const guestEmail = (finalShippingAddress as Record<string, string>).email || email || "";

    if (!guestPhone && !userId) {
        return NextResponse.json({ error: "Vui lòng nhập số điện thoại" }, { status: 400 });
    }

    // Guest checkout: auto-create or find existing user by phone
    if (!userId) {
        const cleanPhone = guestPhone.replace(/\s/g, "").replace(/^\+?84/, "0");
        // Bug #12: Prioritize phone lookup over email to avoid cross-account issues
        let user = cleanPhone
            ? await db.user.findFirst({ where: { phone: cleanPhone } })
            : null;
        if (!user && guestEmail) {
            user = await db.user.findFirst({ where: { email: guestEmail } });
        }

        if (!user) {
            user = await db.user.create({
                data: {
                    phone: cleanPhone || null,
                    email: guestEmail || null,
                    name: guestName || `Khách ${cleanPhone.slice(-4)}`,
                    role: "CUSTOMER",
                },
            });
        } else {
            // Update name if changed
            if (guestName && guestName !== user.name) {
                await db.user.update({
                    where: { id: user.id },
                    data: { name: guestName },
                });
            }
        }
        userId = user.id;
    }

    // 1) Validate variants + snapshot prices
    const variantIds = items.map((i) => i.variantId);
    const variants = await db.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true },
        include: { product: { select: { name: true } } },
    });

    if (variants.length !== items.length) {
        return NextResponse.json({ error: "Sản phẩm không hợp lệ hoặc đã hết hàng" }, { status: 400 });
    }

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
            return NextResponse.json({ error: "Mã giảm giá không tồn tại" }, { status: 400 });
        }
        const now2 = new Date();
        if (!coupon.isActive || now2 < coupon.startsAt || now2 > coupon.endsAt) {
            return NextResponse.json({ error: "Mã giảm giá đã hết hạn" }, { status: 400 });
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return NextResponse.json({ error: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
        }
        if (coupon.perUserLimit) {
            const userUsageCount = await db.couponUsage.count({
                where: { couponId: coupon.id, userId },
            });
            if (userUsageCount >= coupon.perUserLimit) {
                return NextResponse.json({ error: "Bạn đã sử dụng mã này rồi" }, { status: 400 });
            }
        }
        if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
            return NextResponse.json({ error: `Đơn tối thiểu ${coupon.minOrderAmount.toLocaleString("vi-VN")}₫` }, { status: 400 });
        }
        discountTotal =
            coupon.type === "PERCENT"
                ? Math.round((subtotal * coupon.value) / 100)
                : coupon.value;
        if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
            discountTotal = Math.min(discountTotal, coupon.maxDiscountAmount);
        }
        discountTotal = Math.min(discountTotal, subtotal);
        couponId = coupon.id;

        if (coupon.ownerPartnerId) {
            attributionPartnerId = coupon.ownerPartnerId;
        }
    }

    const shippingFee = subtotal - discountTotal >= 500000 ? 0 : 30000;
    const total = subtotal - discountTotal + shippingFee;

    // 4) Check for attribution session
    if (!attributionPartnerId) {
        const attribution = await db.attributionSession.findFirst({
            where: { userId, expiresAt: { gte: new Date() } },
            orderBy: { lastTouch: "desc" },
        });
        if (attribution) {
            attributionPartnerId = attribution.partnerId;
        }
    }

    // 5) Generate order code
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    const ms = String(now.getTime() % 100000).padStart(5, "0");
    const orderCode = `SMK-${dateStr}-${ms}${rand}`;

    // 6) Create order in transaction
    try {
        const order = await db.$transaction(async (tx) => {
            // Re-check stock inside transaction
            const freshVariants = await tx.productVariant.findMany({
                where: { id: { in: variantIds } },
                include: { product: { select: { name: true } } },
            });
            for (const item of items) {
                const v = freshVariants.find((fv) => fv.id === item.variantId);
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
                    shippingAddress: finalShippingAddress,
                    paymentMethod: finalPaymentMethod as "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO" | "ZALOPAY",
                    couponId,
                    note,
                    items: { create: orderItems },
                    statusHistory: { create: { status: "CREATED" } },
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

            // Increment coupon usage
            if (couponId) {
                await tx.coupon.update({ where: { id: couponId }, data: { usageCount: { increment: 1 } } });
                await tx.couponUsage.create({
                    data: { couponId, userId, orderId: order.id },
                });
            }

            // Create referral if attributed
            if (attributionPartnerId) {
                await tx.orderReferral.create({
                    data: {
                        orderId: order.id,
                        partnerId: attributionPartnerId,
                        attributionType: couponId ? "COUPON" : "LAST_CLICK",
                    },
                });
            }

            // Log event
            await tx.eventLog.create({
                data: {
                    type: "PURCHASE",
                    userId,
                    orderId: order.id,
                    payload: { total, paymentMethod: finalPaymentMethod, couponCode: couponCode || null },
                },
            });

            return order;
        });

        return NextResponse.json({ order }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        if (message.startsWith("NOT_ENOUGH_STOCK:")) {
            const productName = message.replace("NOT_ENOUGH_STOCK:", "");
            return NextResponse.json({ error: `Sản phẩm "${productName}" đã hết hàng` }, { status: 400 });
        }
        console.error("[Checkout Error]", err);
        return NextResponse.json({ error: "Có lỗi xảy ra khi đặt hàng" }, { status: 500 });
    }
}
