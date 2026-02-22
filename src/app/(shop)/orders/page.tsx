'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderItem {
    id: string;
    nameSnapshot: string;
    skuSnapshot: string;
    qty: number;
    price: number;
    variant?: { frameColor: string; lensColor: string };
}

interface Order {
    id: string;
    code: string;
    status: string;
    total: number;
    shippingFee: number;
    createdAt: string;
    deliveredAt: string | null;
    items: OrderItem[];
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
    CREATED: { label: 'Chờ xác nhận', class: 'badge-neutral' },
    CONFIRMED: { label: 'Đã xác nhận', class: 'badge-info' },
    PAID: { label: 'Đã thanh toán', class: 'badge-info' },
    SHIPPING: { label: 'Đang giao', class: 'badge-warning' },
    DELIVERED: { label: 'Đã giao', class: 'badge-success' },
    FAILED_DELIVERY: { label: 'Giao thất bại', class: 'badge-error' },
    RETURNED: { label: 'Hoàn trả', class: 'badge-error' },
    CANCELLED: { label: 'Đã huỷ', class: 'badge-error' },
};

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        async function loadOrders() {
            setLoading(true);
            setError('');
            try {
                const params = new URLSearchParams();
                if (statusFilter) params.set('status', statusFilter);
                const res = await fetch(`/api/orders?${params}`);
                if (res.status === 401) {
                    router.replace('/login?redirect=/orders');
                    return;
                }
                if (!res.ok) throw new Error('Không tải được đơn hàng');
                const data = await res.json();
                setOrders(data.orders);
                setPagination(data.pagination);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Lỗi không xác định');
            } finally {
                setLoading(false);
            }
        }
        loadOrders();
    }, [statusFilter, router]);

    /* ── Auth redirect / loading / error states ── */
    if (loading) {
        return (
            <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                    Đơn hàng của tôi
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card" style={{ padding: 'var(--space-4)', height: 80, background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ width: '60%', height: 14, borderRadius: 4, background: 'var(--surface-3)', marginBottom: 8 }} />
                            <div style={{ width: '40%', height: 10, borderRadius: 4, background: 'var(--surface-3)' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Đơn hàng của tôi
            </h1>

            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto', paddingBottom: 4 }}>
                {[
                    { value: '', label: 'Tất cả' },
                    { value: 'CREATED', label: 'Chờ xác nhận' },
                    { value: 'SHIPPING', label: 'Đang giao' },
                    { value: 'DELIVERED', label: 'Đã giao' },
                    { value: 'CANCELLED', label: 'Đã huỷ' },
                ].map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => setStatusFilter(tab.value)}
                        className={`btn btn-sm ${statusFilter === tab.value ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-xs)', fontWeight: 500 }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--error)' }}>
                    {error}
                </div>
            )}

            {!error && orders.length === 0 && (
                <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                    <p style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>📦</p>
                    <p style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                        {statusFilter ? 'Không có đơn hàng nào' : 'Bạn chưa có đơn hàng nào'}
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                        {statusFilter ? 'Thử chọn bộ lọc khác' : 'Hãy khám phá và đặt hàng ngay!'}
                    </p>
                    {!statusFilter && (
                        <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            🛍️ Mua sắm ngay
                        </Link>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {orders.map((order) => {
                    const s = STATUS_CONFIG[order.status] || { label: order.status, class: 'badge-neutral' };
                    return (
                        <div key={order.id} className="card" style={{ padding: 'var(--space-4)' }}>
                            <Link
                                href={`/orders/${order.id}`}
                                style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}
                            >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {order.code}
                                    </p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                        {formatDate(order.createdAt)} • {order.items.length} sản phẩm
                                    </p>
                                    {/* Show first item name */}
                                    {order.items[0] && (
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {order.items[0].nameSnapshot}
                                            {order.items.length > 1 && ` +${order.items.length - 1} sản phẩm khác`}
                                        </p>
                                    )}
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <span className={`badge ${s.class}`}>{s.label}</span>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', marginTop: 'var(--space-1)' }}>
                                        {formatVND(order.total)}
                                    </p>
                                </div>
                            </Link>
                            {order.status === 'DELIVERED' && (
                                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                                    <Link
                                        href={`/orders/${order.id}/return`}
                                        className="btn btn-ghost btn-sm"
                                        style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)' }}
                                    >
                                        🔄 Đổi trả
                                    </Link>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Pagination info */}
            {pagination && pagination.totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                    Trang {pagination.page} / {pagination.totalPages} ({pagination.total} đơn hàng)
                </div>
            )}
        </div>
    );
}
