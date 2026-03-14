import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/admin/analytics — comprehensive admin analytics
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, 'analytics');
    if (authError) return authError;

    const sp = req.nextUrl.searchParams;
    const period = sp.get('period') || '30';
    const offsetDays = Math.max(0, Number(sp.get('offset') || '0'));
    const days = Math.min(365, Math.max(1, Number(period)));

    const now = new Date();
    const endDate = new Date(now.getTime() - offsetDays * 24 * 60 * 60 * 1000);
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    const prevStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Build date filter: if offset > 0 we need an upper bound
    const dateFilter = offsetDays > 0 ? { gte: startDate, lt: endDate } : { gte: startDate };

    try {
        // ═══ 1. Orders for current + previous period ═══
        const [currentOrders, previousOrders] = await Promise.all([
            db.order.findMany({
                where: { createdAt: dateFilter },
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
        const validOrders = currentOrders.filter((o: any) => !['CANCELLED', 'RETURNED'].includes(o.status));
        const prevValidOrders = previousOrders.filter((o: any) => !['CANCELLED', 'RETURNED'].includes(o.status));

        const totalRevenue = validOrders.reduce((s: number, o: any) => s + o.total, 0);
        const prevTotalRevenue = prevValidOrders.reduce((s: number, o: any) => s + o.total, 0);
        const totalDiscount = validOrders.reduce((s: number, o: any) => s + o.discountTotal, 0);
        const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
        const prevAOV = prevValidOrders.length > 0 ? Math.round(prevTotalRevenue / prevValidOrders.length) : 0;

        const cancelledOrders = currentOrders.filter((o: any) => o.status === 'CANCELLED').length;
        const returnedOrders = currentOrders.filter((o: any) => o.status === 'RETURNED').length;
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
            where: { createdAt: dateFilter },
            _count: true,
            _sum: { total: true },
        });

        // ═══ 5. Partner ranking (top 10) ═══
        const partnerReferrals = await db.orderReferral.findMany({
            where: { order: { createdAt: dateFilter, status: { notIn: ['CANCELLED', 'RETURNED'] } } },
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
            where: { order: { createdAt: dateFilter, status: { notIn: ['CANCELLED'] } } },
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
            db.user.count({ where: { role: 'CUSTOMER', createdAt: dateFilter } }),
            db.order.groupBy({
                by: ['userId'],
                where: { createdAt: dateFilter, status: { notIn: ['CANCELLED'] } },
                _count: true,
                having: { userId: { _count: { gt: 1 } } },
            }).then((r: unknown[]) => r.length),
        ]);

        // ═══ 8. Conversion funnel (from events) ═══
        const [viewEvents, cartEvents, checkoutEvents, purchaseEvents] = await Promise.all([
            db.eventLog.count({ where: { type: 'VIEW_PRODUCT', createdAt: dateFilter } }),
            db.eventLog.count({ where: { type: 'ADD_TO_CART', createdAt: dateFilter } }),
            db.eventLog.count({ where: { type: 'BEGIN_CHECKOUT', createdAt: dateFilter } }),
            db.eventLog.count({ where: { type: 'PURCHASE', createdAt: dateFilter } }),
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
            db.review.count({ where: { createdAt: dateFilter } }),
            db.review.aggregate({ where: { createdAt: dateFilter }, _avg: { rating: true } }),
        ]);

        // Rating distribution
        const ratingDist = await db.review.groupBy({
            by: ['rating'],
            where: { createdAt: dateFilter },
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
            where: { createdAt: dateFilter },
            _count: true,
        });

        // ═══ 15. Geographic distribution (from shipping addresses) ═══
        const recentOrdersForGeo = await db.order.findMany({
            where: { createdAt: dateFilter, status: { notIn: ['CANCELLED'] } },
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
                lowStockItems: lowStockItems.map((i: any) => ({
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
        console.error('Analytics API error:', err instanceof Error ? err.message : err);
        console.error('Stack:', err instanceof Error ? err.stack : 'N/A');
        // Return real error with empty data structure so UI shows zeros instead of fake demo numbers
        return NextResponse.json({
            summary: {
                totalRevenue: 0, prevTotalRevenue: 0, revenueGrowth: 0,
                totalOrders: 0, prevTotalOrders: 0, ordersGrowth: 0,
                totalDiscount: 0, avgOrderValue: 0, prevAOV: 0, aovGrowth: 0,
                totalCustomers: 0, newCustomers: 0, repeatCustomers: 0,
                repeatRate: '0', cancelledOrders: 0, returnedOrders: 0,
                cancelRate: 0, returnRate: 0,
            },
            revenueChart: [],
            paymentBreakdown: {},
            paymentStatusBreakdown: {},
            orderStatusDistribution: [],
            partnerRanking: [],
            productPerformance: [],
            conversionFunnel: [
                { stage: 'Xem sản phẩm', count: 0 },
                { stage: 'Thêm giỏ hàng', count: 0 },
                { stage: 'Bắt đầu thanh toán', count: 0 },
                { stage: 'Hoàn tất mua', count: 0 },
            ],
            categoryBreakdown: [],
            inventory: { totalVariants: 0, lowStockCount: 0, outOfStockCount: 0, lowStockItems: [] },
            reviews: { total: 0, avgRating: 0, distribution: [] },
            timeAnalysis: {
                hourlyRevenue: new Array(24).fill(0),
                hourlyOrders: new Array(24).fill(0),
                weekdayRevenue: new Array(7).fill(0),
                weekdayOrders: new Array(7).fill(0),
                weekdayNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            },
            shippingStats: [],
            geoDistribution: [],
            period: days,
            _error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
}

