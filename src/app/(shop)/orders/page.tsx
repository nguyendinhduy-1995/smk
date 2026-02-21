import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đơn hàng của tôi',
};

// Demo orders
const DEMO_ORDERS = [
    { id: 'ord1', code: 'SMK-20260220-001', status: 'DELIVERED', total: 2990000, items: 1, date: '20/02/2026' },
    { id: 'ord2', code: 'SMK-20260218-003', status: 'SHIPPING', total: 5890000, items: 2, date: '18/02/2026' },
    { id: 'ord3', code: 'SMK-20260215-007', status: 'CREATED', total: 3290000, items: 1, date: '15/02/2026' },
];

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
    CREATED: { label: 'Đã tạo', class: 'badge-neutral' },
    CONFIRMED: { label: 'Xác nhận', class: 'badge-info' },
    PAID: { label: 'Đã thanh toán', class: 'badge-info' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Đã huỷ', class: 'badge-error' },
};

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function OrdersPage() {
    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                Đơn hàng của tôi
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {DEMO_ORDERS.map((order) => {
                    const s = STATUS_CONFIG[order.status];
                    return (
                        <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                textDecoration: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                minHeight: 'var(--touch-target, 44px)',
                            }}
                        >
                            <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {order.code}
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                    {order.date} • {order.items} sản phẩm
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className={`badge ${s.class}`}>{s.label}</span>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', marginTop: 'var(--space-1)' }}>
                                    {formatVND(order.total)}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
