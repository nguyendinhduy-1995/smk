import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';

// GET /api/admin/customers — list customers with order stats
export async function GET(req: NextRequest) {
    const session = getSessionFromRequest(req);
    if (!session || !hasPermission(session, 'orders')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page')) || 1);
    const limit = Math.min(50, Number(sp.get('limit')) || 30);

    const where: Record<string, unknown> = { role: 'CUSTOMER' };
    if (sp.get('q')) {
        where.OR = [
            { name: { contains: sp.get('q')!, mode: 'insensitive' } },
            { email: { contains: sp.get('q')!, mode: 'insensitive' } },
            { phone: { contains: sp.get('q')! } },
        ];
    }

    const [customers, total] = await Promise.all([
        db.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                orders: {
                    select: { total: true, status: true, shippingAddress: true },
                    orderBy: { createdAt: 'desc' as const },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        db.user.count({ where }),
    ]);

    const result = customers.map(c => {
        const totalSpent = c.orders
            .filter(o => !['CANCELLED', 'RETURNED'].includes(o.status))
            .reduce((sum, o) => sum + o.total, 0);
        const lastAddress = c.orders.length > 0 ? c.orders[0].shippingAddress as Record<string, string> | null : null;
        return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            createdAt: c.createdAt,
            orderCount: c.orders.length,
            totalSpent,
            address: lastAddress ? [lastAddress.address, lastAddress.ward, lastAddress.district, lastAddress.province].filter(Boolean).join(', ') : null,
        };
    });

    return NextResponse.json({
        customers: result,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}
