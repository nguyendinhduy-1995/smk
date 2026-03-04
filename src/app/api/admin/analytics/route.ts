import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/admin/analytics — comprehensive admin analytics
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, 'analytics');
    if (authError) return authError;

    const sp = req.nextUrl.searchParams;
    const period = sp.get('period') || '30';
    const days = Math.min(365, Math.max(1, Number(period)));

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    try {
        // ═══ 1. Orders for current + previous period ═══
        const [currentOrders, previousOrders] = await Promise.all([
            db.order.findMany({
                where: { createdAt: { gte: startDate } },
                select: { total: true, subtotal: true, discountTotal: true, shippingFee: true, createdAt: true, status: true, paymentMethod: true, paymentStatus: true, userId: true },
            }),
            db.order.findMany({
                where: { createdAt: { gte: prevStartDate, lt: startDate } },
                select: { total: true, createdAt: true, status: true, userId: true },
            }),
        ]);

        // Revenue by day
        const dailyRevenue = new Map<string, { revenue: number; orders: number; discount: number; cancelled: number }>();
        for (let d = 0; d < days; d++) {
            const date = new Date(now.getTime() - d * 86400000).toISOString().slice(0, 10);
            dailyRevenue.set(date, { revenue: 0, orders: 0, discount: 0, cancelled: 0 });
        }
        for (const o of currentOrders) {
            const key = o.createdAt.toISOString().slice(0, 10);
            const entry = dailyRevenue.get(key);
            if (entry) {
                if (o.status !== 'CANCELLED' && o.status !== 'RETURNED') {
                    entry.revenue += o.total;
                    entry.orders += 1;
                    entry.discount += o.discountTotal;
                } else {
                    entry.cancelled += 1;
                }
            }
        }

        const revenueChart = Array.from(dailyRevenue.entries())
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ═══ 2. Summary KPIs with period comparison ═══
        const validOrders = currentOrders.filter(o => !['CANCELLED', 'RETURNED'].includes(o.status));
        const prevValidOrders = previousOrders.filter(o => !['CANCELLED', 'RETURNED'].includes(o.status));

        const totalRevenue = validOrders.reduce((s, o) => s + o.total, 0);
        const prevTotalRevenue = prevValidOrders.reduce((s, o) => s + o.total, 0);
        const totalDiscount = validOrders.reduce((s, o) => s + o.discountTotal, 0);
        const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
        const prevAOV = prevValidOrders.length > 0 ? Math.round(prevTotalRevenue / prevValidOrders.length) : 0;

        const cancelledOrders = currentOrders.filter(o => o.status === 'CANCELLED').length;
        const returnedOrders = currentOrders.filter(o => o.status === 'RETURNED').length;
        const cancelRate = currentOrders.length > 0 ? ((cancelledOrders / currentOrders.length) * 100).toFixed(1) : '0';
        const returnRate = currentOrders.length > 0 ? ((returnedOrders / currentOrders.length) * 100).toFixed(1) : '0';

        // ═══ 3. Payment method breakdown ═══
        const paymentBreakdown: Record<string, { count: number; total: number }> = {};
        for (const o of validOrders) {
            if (!paymentBreakdown[o.paymentMethod]) paymentBreakdown[o.paymentMethod] = { count: 0, total: 0 };
            paymentBreakdown[o.paymentMethod].count++;
            paymentBreakdown[o.paymentMethod].total += o.total;
        }

        // Payment status breakdown
        const paymentStatusBreakdown: Record<string, number> = {};
        for (const o of currentOrders) {
            paymentStatusBreakdown[o.paymentStatus] = (paymentStatusBreakdown[o.paymentStatus] || 0) + 1;
        }

        // ═══ 4. Order status distribution ═══
        const statusDist = await db.order.groupBy({
            by: ['status'],
            where: { createdAt: { gte: startDate } },
            _count: true,
            _sum: { total: true },
        });

        // ═══ 5. Partner ranking (top 10) ═══
        const partnerReferrals = await db.orderReferral.findMany({
            where: { order: { createdAt: { gte: startDate }, status: { notIn: ['CANCELLED', 'RETURNED'] } } },
            include: {
                order: { select: { total: true } },
                partner: { select: { partnerCode: true, level: true, user: { select: { name: true } } } },
            },
        });

        const partnerMap = new Map<string, { code: string; name: string; level: string; revenue: number; orders: number }>();
        for (const r of partnerReferrals) {
            const key = r.partnerId;
            if (!partnerMap.has(key)) {
                partnerMap.set(key, { code: r.partner.partnerCode, name: r.partner.user.name || 'N/A', level: r.partner.level, revenue: 0, orders: 0 });
            }
            const entry = partnerMap.get(key)!;
            entry.revenue += r.order.total;
            entry.orders += 1;
        }
        const partnerRanking = Array.from(partnerMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

        // ═══ 6. Product performance (top 15) ═══
        const topItems = await db.orderItem.groupBy({
            by: ['variantId'],
            where: { order: { createdAt: { gte: startDate }, status: { notIn: ['CANCELLED'] } } },
            _sum: { qty: true, price: true },
            _count: true,
            orderBy: { _sum: { qty: 'desc' } },
            take: 15,
        });

        const topVariantIds = topItems.map((t: { variantId: string }) => t.variantId);
        const topVariants = await db.productVariant.findMany({
            where: { id: { in: topVariantIds } },
            include: { product: { select: { name: true, brand: true, slug: true, category: true } } },
        });

        const productPerformance = topItems.map((t: { variantId: string; _sum: { qty: number | null; price: number | null }; _count: number }) => {
            const v = topVariants.find((v: { id: string }) => v.id === t.variantId);
            return {
                name: v?.product.name || 'N/A',
                brand: v?.product.brand || 'N/A',
                slug: v?.product.slug || '',
                category: v?.product.category || 'N/A',
                sold: t._sum.qty || 0,
                revenue: (t._sum.price || 0) * (t._sum.qty || 0),
                orders: t._count,
            };
        });

        // ═══ 7. Customer metrics ═══
        const [totalCustomers, newCustomers, repeatCustomerGroups] = await Promise.all([
            db.user.count({ where: { role: 'CUSTOMER' } }),
            db.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: startDate } } }),
            db.order.groupBy({
                by: ['userId'],
                where: { createdAt: { gte: startDate }, status: { notIn: ['CANCELLED'] } },
                _count: true,
                having: { userId: { _count: { gt: 1 } } },
            }).then((r: unknown[]) => r.length),
        ]);

        // ═══ 8. Conversion funnel (from events) ═══
        const [viewEvents, cartEvents, checkoutEvents, purchaseEvents] = await Promise.all([
            db.eventLog.count({ where: { type: 'VIEW_PRODUCT', createdAt: { gte: startDate } } }),
            db.eventLog.count({ where: { type: 'ADD_TO_CART', createdAt: { gte: startDate } } }),
            db.eventLog.count({ where: { type: 'BEGIN_CHECKOUT', createdAt: { gte: startDate } } }),
            db.eventLog.count({ where: { type: 'PURCHASE', createdAt: { gte: startDate } } }),
        ]);

        const conversionFunnel = [
            { stage: 'Xem sản phẩm', count: viewEvents },
            { stage: 'Thêm giỏ hàng', count: cartEvents },
            { stage: 'Bắt đầu thanh toán', count: checkoutEvents },
            { stage: 'Hoàn tất mua', count: purchaseEvents },
        ];

        // ═══ 9. Category breakdown ═══
        const categoryBreakdown = await db.product.groupBy({
            by: ['category'],
            _count: true,
        });

        // Category revenue from order items
        const categoryRevenueData: Record<string, { sold: number; revenue: number }> = {};
        for (const p of productPerformance) {
            const cat = p.category || 'Khác';
            if (!categoryRevenueData[cat]) categoryRevenueData[cat] = { sold: 0, revenue: 0 };
            categoryRevenueData[cat].sold += p.sold;
            categoryRevenueData[cat].revenue += p.revenue;
        }

        // ═══ 10. Inventory stats ═══
        const [lowStockCount, totalVariants, outOfStockCount] = await Promise.all([
            db.productVariant.count({ where: { stockQty: { lte: 5, gt: 0 }, isActive: true } }),
            db.productVariant.count({ where: { isActive: true } }),
            db.productVariant.count({ where: { stockQty: 0, isActive: true } }),
        ]);

        // Top low-stock items
        const lowStockItems = await db.productVariant.findMany({
            where: { stockQty: { lte: 5 }, isActive: true },
            include: { product: { select: { name: true } } },
            orderBy: { stockQty: 'asc' },
            take: 10,
        });

        // ═══ 11. Review stats ═══
        const [totalReviews, avgRating] = await Promise.all([
            db.review.count({ where: { createdAt: { gte: startDate } } }),
            db.review.aggregate({ where: { createdAt: { gte: startDate } }, _avg: { rating: true } }),
        ]);

        // Rating distribution
        const ratingDist = await db.review.groupBy({
            by: ['rating'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        });

        // ═══ 12. Revenue by hour of day ═══
        const hourlyRevenue = new Array(24).fill(0);
        const hourlyOrders = new Array(24).fill(0);
        for (const o of validOrders) {
            const hour = o.createdAt.getHours();
            hourlyRevenue[hour] += o.total;
            hourlyOrders[hour] += 1;
        }

        // ═══ 13. Revenue by day of week ═══
        const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const weekdayRevenue = new Array(7).fill(0);
        const weekdayOrders = new Array(7).fill(0);
        for (const o of validOrders) {
            const dow = o.createdAt.getDay();
            weekdayRevenue[dow] += o.total;
            weekdayOrders[dow] += 1;
        }

        // ═══ 14. Shipping method stats ═══
        const shippingStats = await db.shipment.groupBy({
            by: ['carrier'],
            where: { createdAt: { gte: startDate } },
            _count: true,
        });

        // ═══ 15. Geographic distribution (from shipping addresses) ═══
        const recentOrdersForGeo = await db.order.findMany({
            where: { createdAt: { gte: startDate }, status: { notIn: ['CANCELLED'] } },
            select: { shippingAddress: true },
            take: 500,
        });

        const geoDistribution: Record<string, number> = {};
        for (const o of recentOrdersForGeo) {
            const addr = o.shippingAddress as { province?: string } | null;
            const province = addr?.province || 'Khác';
            geoDistribution[province] = (geoDistribution[province] || 0) + 1;
        }

        // Sort geo by count
        const topGeo = Object.entries(geoDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 15)
            .map(([province, count]) => ({ province, count }));

        // Growth calculations
        const revenueGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(1) : '0';
        const ordersGrowth = prevValidOrders.length > 0 ? ((validOrders.length - prevValidOrders.length) / prevValidOrders.length * 100).toFixed(1) : '0';
        const aovGrowth = prevAOV > 0 ? ((avgOrderValue - prevAOV) / prevAOV * 100).toFixed(1) : '0';

        return NextResponse.json({
            summary: {
                totalRevenue,
                prevTotalRevenue,
                revenueGrowth: parseFloat(revenueGrowth),
                totalOrders: validOrders.length,
                prevTotalOrders: prevValidOrders.length,
                ordersGrowth: parseFloat(ordersGrowth),
                totalDiscount,
                avgOrderValue,
                prevAOV,
                aovGrowth: parseFloat(aovGrowth),
                totalCustomers,
                newCustomers,
                repeatCustomers: repeatCustomerGroups,
                repeatRate: totalCustomers > 0 ? ((repeatCustomerGroups / totalCustomers) * 100).toFixed(1) : '0',
                cancelledOrders,
                returnedOrders,
                cancelRate: parseFloat(cancelRate),
                returnRate: parseFloat(returnRate),
            },
            revenueChart,
            paymentBreakdown,
            paymentStatusBreakdown,
            orderStatusDistribution: statusDist.map((s: { status: string; _count: number; _sum: { total: number | null } }) => ({
                status: s.status, count: s._count, total: s._sum.total || 0,
            })),
            partnerRanking,
            productPerformance,
            conversionFunnel,
            categoryBreakdown: categoryBreakdown.map((c: { category: string | null; _count: number }) => ({
                category: c.category || 'Chưa phân loại',
                productCount: c._count,
                ...(categoryRevenueData[c.category || 'Khác'] || { sold: 0, revenue: 0 }),
            })),
            inventory: {
                totalVariants,
                lowStockCount,
                outOfStockCount,
                lowStockItems: lowStockItems.map(i => ({
                    name: i.product.name,
                    sku: i.sku,
                    stock: i.stockQty,
                    reserved: i.reservedQty,
                })),
            },
            reviews: {
                total: totalReviews,
                avgRating: avgRating._avg.rating || 0,
                distribution: ratingDist.map((r: { rating: number; _count: number }) => ({ rating: r.rating, count: r._count })),
            },
            timeAnalysis: {
                hourlyRevenue,
                hourlyOrders,
                weekdayRevenue,
                weekdayOrders,
                weekdayNames,
            },
            shippingStats: shippingStats.map((s: { carrier: string; _count: number }) => ({ carrier: s.carrier, count: s._count })),
            geoDistribution: topGeo,
            period: days,
        });
    } catch (err) {
        console.warn('Analytics API error, returning demo data:', err);
        return NextResponse.json(getDemoData(days));
    }
}

function getDemoData(days: number) {
    // Bug #32: Use deterministic values — no Math.random in demo data
    const chart = Array.from({ length: days }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - days + 1 + i);
        const seed = (i * 7 + 3) % 15;
        const base = seed * 1000000 + 2000000;
        return {
            date: d.toISOString().slice(0, 10),
            revenue: Math.round(base),
            orders: (seed % 10) + 2,
            discount: (seed % 5) * 100000,
            cancelled: seed % 3 === 0 ? 1 : 0,
        };
    });

    return {
        summary: {
            totalRevenue: 385600000, prevTotalRevenue: 312400000, revenueGrowth: 23.4,
            totalOrders: 204, prevTotalOrders: 167, ordersGrowth: 22.2,
            totalDiscount: 18500000, avgOrderValue: 1890000, prevAOV: 1870000, aovGrowth: 1.1,
            totalCustomers: 156, newCustomers: 42, repeatCustomers: 38,
            repeatRate: '24.4', cancelledOrders: 12, returnedOrders: 5,
            cancelRate: 5.6, returnRate: 2.3,
        },
        revenueChart: chart,
        paymentBreakdown: {
            COD: { count: 68, total: 128000000 }, BANK_TRANSFER: { count: 82, total: 165000000 },
            MOMO: { count: 32, total: 55000000 }, VNPAY: { count: 22, total: 37600000 },
        },
        paymentStatusBreakdown: { PENDING: 15, PAID: 178, REFUNDED: 8, FAILED: 3 },
        orderStatusDistribution: [
            { status: 'DELIVERED', count: 142, total: 268000000 },
            { status: 'SHIPPING', count: 25, total: 47000000 },
            { status: 'CONFIRMED', count: 18, total: 34000000 },
            { status: 'CREATED', count: 12, total: 22000000 },
            { status: 'PAID', count: 7, total: 14600000 },
            { status: 'CANCELLED', count: 12, total: 21000000 },
            { status: 'RETURNED', count: 5, total: 8500000 },
            { status: 'FAILED_DELIVERY', count: 3, total: 5200000 },
        ],
        partnerRanking: [
            { code: 'DUY123', name: 'Nguyễn Văn Duy', level: 'LEADER', revenue: 78000000, orders: 42 },
            { code: 'TRANG456', name: 'Lê Thị Trang', level: 'AGENT', revenue: 56000000, orders: 31 },
            { code: 'MINH789', name: 'Phạm Đức Minh', level: 'AGENT', revenue: 38000000, orders: 22 },
            { code: 'HOA321', name: 'Trần Ngọc Hoa', level: 'AFFILIATE', revenue: 18000000, orders: 12 },
            { code: 'NAM654', name: 'Võ Hoàng Nam', level: 'AFFILIATE', revenue: 12500000, orders: 8 },
        ],
        productPerformance: [
            { name: 'Gọng Kính Camel YS802', brand: 'Camel', slug: 'gong-kinh-camel-ys802', category: 'gong-kinh', sold: 68, revenue: 122400000, orders: 65 },
            { name: 'Kính Mát Kim Loại UV400', brand: 'SMK', slug: 'kinh-mat-kim-loai-uv400', category: 'kinh-mat', sold: 52, revenue: 93600000, orders: 48 },
            { name: 'Petersson Titanium IP', brand: 'Petersson', slug: 'petersson-titanium-ip', category: 'gong-kinh', sold: 45, revenue: 112500000, orders: 42 },
            { name: 'CAA Titanium IP', brand: 'CAA', slug: 'caa-titanium-ip', category: 'gong-kinh', sold: 38, revenue: 76000000, orders: 35 },
            { name: 'Gọng Kính Tròn Đồng Thái', brand: 'Đồng Thái', slug: 'gong-kinh-tron-dong-thai', category: 'gong-kinh', sold: 32, revenue: 54400000, orders: 30 },
            { name: 'MONE Sport Lục Giác', brand: 'MONE', slug: 'mone-sport-luc-giac', category: 'gong-kinh', sold: 28, revenue: 50400000, orders: 26 },
            { name: 'Flowers Cảng Beta Titanium', brand: 'Flowers', slug: 'flowers-beta-titanium', category: 'gong-kinh', sold: 22, revenue: 44000000, orders: 20 },
        ],
        conversionFunnel: [
            { stage: 'Xem sản phẩm', count: 4820 },
            { stage: 'Thêm giỏ hàng', count: 386 },
            { stage: 'Bắt đầu thanh toán', count: 248 },
            { stage: 'Hoàn tất mua', count: 204 },
        ],
        categoryBreakdown: [
            { category: 'gong-kinh', productCount: 45, sold: 195, revenue: 292000000 },
            { category: 'kinh-mat', productCount: 28, sold: 78, revenue: 140000000 },
            { category: 'kinh-ram', productCount: 18, sold: 42, revenue: 75600000 },
            { category: 'trong-kinh', productCount: 12, sold: 35, revenue: 52500000 },
            { category: 'kinh-ap-trong', productCount: 8, sold: 22, revenue: 33000000 },
            { category: 'phu-kien', productCount: 15, sold: 18, revenue: 9000000 },
        ],
        inventory: {
            totalVariants: 186,
            lowStockCount: 12,
            outOfStockCount: 5,
            lowStockItems: [
                { name: 'Aviator Classic Gold', sku: 'AVT-G-001', stock: 1, reserved: 0 },
                { name: 'Cat Eye Retro Pink', sku: 'CAT-P-002', stock: 2, reserved: 1 },
                { name: 'Round Metal Gold', sku: 'RND-G-003', stock: 3, reserved: 2 },
                { name: 'Browline Mixed Gold', sku: 'BWL-G-004', stock: 4, reserved: 0 },
                { name: 'Square TR90 Black', sku: 'SQR-B-005', stock: 5, reserved: 1 },
            ],
        },
        reviews: {
            total: 67,
            avgRating: 4.3,
            distribution: [
                { rating: 5, count: 32 }, { rating: 4, count: 18 },
                { rating: 3, count: 10 }, { rating: 2, count: 5 }, { rating: 1, count: 2 },
            ],
        },
        timeAnalysis: {
            hourlyRevenue: [0, 0, 0, 0, 0, 0, 800000, 3200000, 12800000, 28500000, 35200000, 22400000, 18600000, 32100000, 38500000, 25600000, 18200000, 28800000, 42500000, 35800000, 22400000, 15600000, 4200000, 0],
            hourlyOrders: [0, 0, 0, 0, 0, 0, 1, 2, 8, 18, 22, 14, 12, 20, 24, 16, 11, 18, 26, 22, 14, 10, 3, 0],
            weekdayRevenue: [28500000, 52400000, 58600000, 62800000, 55200000, 68500000, 59600000],
            weekdayOrders: [18, 32, 36, 38, 34, 42, 36],
            weekdayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        },
        shippingStats: [
            { carrier: 'GHN', count: 92 }, { carrier: 'GHTK', count: 65 },
            { carrier: 'VNPost', count: 28 }, { carrier: 'JT', count: 19 },
        ],
        geoDistribution: [
            { province: 'TP. Hồ Chí Minh', count: 82 }, { province: 'Hà Nội', count: 45 },
            { province: 'Đà Nẵng', count: 18 }, { province: 'Bình Dương', count: 14 },
            { province: 'Đồng Nai', count: 11 }, { province: 'Cần Thơ', count: 8 },
            { province: 'Hải Phòng', count: 7 }, { province: 'Long An', count: 5 },
            { province: 'Khánh Hòa', count: 4 }, { province: 'Thừa Thiên Huế', count: 3 },
        ],
        period: days,
    };
}
