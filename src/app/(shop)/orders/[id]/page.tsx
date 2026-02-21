'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface TimelineEvent { status: string; label: string; icon: string; description: string; createdAt: string }
interface OrderDetail {
    code: string; status: string; total: number; subtotal: number; discountTotal: number; shippingFee: number;
    paymentMethod: string; paymentStatus: string; trackingNumber: string | null; trackingUrl: string | null;
    shippingAddress: Record<string, string>; note: string | null; createdAt: string;
    items: { name: string; qty: number; price: number; slug: string }[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        params.then(({ id }) => {
            setOrderId(id);
            fetch(`/api/orders/${id}/tracking`, { headers: { 'x-user-id': 'demo-user' } })
                .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); })
                .then((data) => { setOrder(data.order); setTimeline(data.timeline); })
                .catch(() => setError('Không tìm thấy đơn hàng'))
                .finally(() => setLoading(false));
        });
    }, [params]);

    const STEP_ORDER = ['CREATED', 'CONFIRMED', 'PAID', 'SHIPPING', 'DELIVERED'];
    const STEP_LABELS: Record<string, string> = { CREATED: 'Đặt hàng', CONFIRMED: 'Xác nhận', PAID: 'Thanh toán', SHIPPING: 'Giao hàng', DELIVERED: 'Nhận hàng' };
    const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
        CREATED: { label: 'Mới tạo', cls: 'badge-neutral' }, CONFIRMED: { label: 'Xác nhận', cls: 'badge-warning' },
        PAID: { label: 'Đã thanh toán', cls: 'badge-success' }, SHIPPING: { label: 'Đang giao', cls: 'badge-warning' },
        DELIVERED: { label: 'Đã giao', cls: 'badge-success' }, RETURNED: { label: 'Hoàn trả', cls: 'badge-error' },
        CANCELLED: { label: 'Đã huỷ', cls: 'badge-error' },
    };

    if (loading) return <div className="container animate-in" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>Đang tải...</div>;
    if (error || !order) return (
        <div className="container animate-in" style={{ padding: 'var(--space-16) var(--space-4)', textAlign: 'center' }}>
            <p style={{ fontSize: 64, marginBottom: 'var(--space-4)' }}>📦</p>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{error || 'Không tìm thấy'}</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>Mã đơn: {orderId}</p>
            <Link href="/orders" className="btn btn-primary">← Đơn hàng của tôi</Link>
        </div>
    );

    const currentStepIdx = STEP_ORDER.indexOf(order.status);

    return (
        <div className="container animate-in" style={{ maxWidth: 720, margin: '0 auto', paddingTop: 'var(--space-4)' }}>
            <nav style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                <Link href="/orders" style={{ color: 'var(--text-muted)' }}>Đơn hàng</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>{order.code}</span>
            </nav>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{order.code}</h1>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Ngày tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`badge ${STATUS_BADGES[order.status]?.cls || 'badge-neutral'}`}>{STATUS_BADGES[order.status]?.label || order.status}</span>
            </div>

            {/* Progress Steps */}
            {!['CANCELLED', 'RETURNED'].includes(order.status) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-8)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 3, background: 'var(--bg-tertiary)', zIndex: 0 }}>
                        <div style={{ width: `${Math.max(0, currentStepIdx / (STEP_ORDER.length - 1)) * 100}%`, height: '100%', background: 'var(--gold-400)', transition: 'width 500ms' }} />
                    </div>
                    {STEP_ORDER.map((step, i) => {
                        const done = i <= currentStepIdx;
                        const active = i === currentStepIdx;
                        return (
                            <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'var(--gold-400)' : 'var(--bg-tertiary)', color: done ? '#0a0a0f' : 'var(--text-muted)',
                                    fontWeight: 700, fontSize: 'var(--text-sm)', boxShadow: active ? '0 0 0 4px rgba(212,168,83,0.3)' : 'none',
                                }}>
                                    {done ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: 10, color: done ? 'var(--text-primary)' : 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>{STEP_LABELS[step]}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tracking */}
            {order.trackingNumber && (
                <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--gold-500)' }}>
                    <div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Mã vận đơn</p>
                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{order.trackingNumber}</p>
                    </div>
                    {order.trackingUrl ? (
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">Tra cứu vận đơn</a>
                    ) : (
                        <span className="btn btn-ghost btn-sm" style={{ cursor: 'default' }}>GHN / GHTK</span>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📦 Lịch sử trạng thái</h3>
                <div style={{ position: 'relative', paddingLeft: 'var(--space-6)' }}>
                    <div style={{ position: 'absolute', left: 11, top: 4, bottom: 4, width: 2, background: 'var(--bg-tertiary)' }} />
                    {timeline.slice().reverse().map((e, i) => (
                        <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', position: 'relative' }}>
                            <div style={{
                                position: 'absolute', left: -20, top: 2, width: 24, height: 24, borderRadius: '50%',
                                background: i === 0 ? 'var(--gold-400)' : 'var(--bg-secondary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                                border: '2px solid var(--bg-primary)',
                            }}>
                                {e.icon}
                            </div>
                            <div style={{ flex: 1, marginLeft: 12 }}>
                                <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{e.label}</p>
                                {e.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{e.description}</p>}
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(e.createdAt).toLocaleString('vi-VN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Items */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Sản phẩm</h3>
                {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                        <div style={{ width: 60, height: 60, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👓</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.name}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>x{item.qty}</p>
                        </div>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(item.price * item.qty)}</span>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-tertiary)' }}>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
                    {order.discountTotal > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--success)' }}>Giảm giá</span><span style={{ color: 'var(--success)' }}>-{formatVND(order.discountTotal)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-tertiary)' }}>Phí vận chuyển</span><span style={{ color: order.shippingFee === 0 ? 'var(--success)' : undefined }}>{order.shippingFee === 0 ? 'Miễn phí' : formatVND(order.shippingFee)}</span></div>
                    <div className="divider" style={{ margin: 'var(--space-2) 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(order.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
