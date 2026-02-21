'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

type Step = 'address' | 'shipping' | 'payment' | 'confirm';

const STEPS: { key: Step; label: string }[] = [
    { key: 'address', label: 'Địa chỉ' },
    { key: 'shipping', label: 'Vận chuyển' },
    { key: 'payment', label: 'Thanh toán' },
    { key: 'confirm', label: 'Xác nhận' },
];

export default function CheckoutPage() {
    const [step, setStep] = useState<Step>('address');
    const [paymentMethod, setPaymentMethod] = useState<string>('COD');
    const { items, subtotal } = useCartStore();
    const sub = subtotal();
    const shipping = sub >= 500000 ? 0 : 30000;
    const total = sub + shipping;

    const stepIndex = STEPS.findIndex((s) => s.key === step);

    if (items.length === 0) {
        return (
            <div className="container animate-in">
                <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                    <div className="empty-state__icon">🛒</div>
                    <h3 className="empty-state__title">Chưa có sản phẩm</h3>
                    <p className="empty-state__desc">Thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                        Mua sắm ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                Thanh toán
            </h1>

            {/* Steps */}
            <div className="checkout-steps">
                {STEPS.map((s, i) => (
                    <div key={s.key} style={{ display: 'contents' }}>
                        <div className={`checkout-step ${i === stepIndex ? 'checkout-step--active' : i < stepIndex ? 'checkout-step--done' : ''}`}>
                            <span className="checkout-step__number">
                                {i < stepIndex ? '✓' : i + 1}
                            </span>
                            <span className="hide-mobile" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <span className="checkout-step__divider" />}
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', maxWidth: 720 }}>
                {/* Address Step */}
                {step === 'address' && (
                    <div className="card animate-in" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            📍 Địa chỉ nhận hàng
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                <div className="input-group">
                                    <label className="input-label">Họ tên</label>
                                    <input className="input" placeholder="Nguyễn Văn A" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Số điện thoại</label>
                                    <input className="input" placeholder="0912 345 678" type="tel" />
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email (tuỳ chọn)</label>
                                <input className="input" placeholder="email@example.com" type="email" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                                <div className="input-group">
                                    <label className="input-label">Tỉnh/Thành</label>
                                    <select className="input"><option>Chọn tỉnh</option></select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Quận/Huyện</label>
                                    <select className="input"><option>Chọn quận</option></select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phường/Xã</label>
                                    <select className="input"><option>Chọn phường</option></select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Địa chỉ cụ thể</label>
                                <input className="input" placeholder="Số nhà, tên đường..." />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Ghi chú (tuỳ chọn)</label>
                                <textarea className="input" rows={2} placeholder="Ghi chú cho đơn hàng..." />
                            </div>
                        </div>
                        <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-6)' }} onClick={() => setStep('shipping')}>
                            Tiếp tục
                        </button>
                    </div>
                )}

                {/* Shipping Step */}
                {step === 'shipping' && (
                    <div className="card animate-in" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            🚚 Phương thức vận chuyển
                        </h3>
                        {[
                            { id: 'standard', name: 'Tiêu chuẩn', desc: '3-5 ngày làm việc', price: 30000 },
                            { id: 'express', name: 'Nhanh', desc: '1-2 ngày làm việc', price: 50000 },
                        ].map((opt) => (
                            <label
                                key={opt.id}
                                className="card"
                                style={{
                                    padding: 'var(--space-4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    cursor: 'pointer',
                                    marginBottom: 'var(--space-2)',
                                }}
                            >
                                <input type="radio" name="shipping" defaultChecked={opt.id === 'standard'} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{opt.name}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{opt.desc}</p>
                                </div>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--gold-400)' }}>
                                    {sub >= 500000 && opt.id === 'standard' ? 'Miễn phí' : formatVND(opt.price)}
                                </span>
                            </label>
                        ))}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-ghost" onClick={() => setStep('address')}>← Quay lại</button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep('payment')}>Tiếp tục</button>
                        </div>
                    </div>
                )}

                {/* Payment Step */}
                {step === 'payment' && (
                    <div className="card animate-in" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            💳 Phương thức thanh toán
                        </h3>
                        {[
                            { id: 'COD', name: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
                            { id: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
                            { id: 'VNPAY', name: 'VNPAY', icon: '💳' },
                            { id: 'MOMO', name: 'Ví MoMo', icon: '📱' },
                            { id: 'ZALOPAY', name: 'ZaloPay', icon: '💙' },
                        ].map((opt) => (
                            <label
                                key={opt.id}
                                className="card"
                                style={{
                                    padding: 'var(--space-4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    cursor: 'pointer',
                                    marginBottom: 'var(--space-2)',
                                    borderColor: paymentMethod === opt.id ? 'var(--gold-500)' : undefined,
                                }}
                            >
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === opt.id}
                                    onChange={() => setPaymentMethod(opt.id)}
                                />
                                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{opt.name}</span>
                            </label>
                        ))}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-ghost" onClick={() => setStep('shipping')}>← Quay lại</button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setStep('confirm')}>Tiếp tục</button>
                        </div>
                    </div>
                )}

                {/* Confirm Step */}
                {step === 'confirm' && (
                    <div className="card animate-in" style={{ padding: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            ✅ Xác nhận đơn hàng
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {items.map((item) => (
                                <div key={item.variantId} style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                                    <span style={{ color: 'var(--text-tertiary)' }}>{item.qty}x</span>
                                    <span style={{ flex: 1 }}>{item.productName} ({item.frameColor})</span>
                                    <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{formatVND(item.price * item.qty)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="divider" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Tạm tính</span>
                                <span>{formatVND(sub)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Phí vận chuyển</span>
                                <span style={{ color: shipping === 0 ? 'var(--success)' : 'inherit' }}>
                                    {shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
                                </span>
                            </div>
                            <div className="divider" style={{ margin: 'var(--space-2) 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 600 }}>Tổng cộng</span>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)' }}>
                                    {formatVND(total)}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                            <button className="btn btn-ghost" onClick={() => setStep('payment')}>← Quay lại</button>
                            <button className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                                Đặt hàng
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
