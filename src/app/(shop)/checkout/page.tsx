'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

type Step = 'info' | 'confirm';

interface FormData {
    name: string; phone: string; email: string;
    province: string; district: string; ward: string;
    address: string; note: string;
    shipping: string; payment: string;
}

interface FormErrors { [key: string]: string }

export default function CheckoutPage() {
    const [step, setStep] = useState<Step>('info');
    const [form, setForm] = useState<FormData>({
        name: '', phone: '', email: '',
        province: '', district: '', ward: '',
        address: '', note: '',
        shipping: 'standard', payment: 'COD',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef<HTMLDivElement>(null);
    const { items, subtotal, clearCart } = useCartStore();
    const sub = subtotal();
    const shippingCost = form.shipping === 'express' ? 50000 : (sub >= 500000 ? 0 : 30000);
    const total = sub + shippingCost;

    const updateField = useCallback((field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear error on change
        if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }, [errors]);

    const validateForm = useCallback((): boolean => {
        const e: FormErrors = {};
        if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
        if (!form.phone.trim()) e.phone = 'Vui lòng nhập SĐT';
        else if (!/^0\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'SĐT không hợp lệ';
        if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
        setErrors(e);

        // Auto-focus first error
        if (Object.keys(e).length > 0) {
            const firstKey = Object.keys(e)[0];
            const el = formRef.current?.querySelector(`[name="${firstKey}"]`) as HTMLElement;
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return Object.keys(e).length === 0;
    }, [form]);

    const goToConfirm = useCallback(() => {
        if (validateForm()) setStep('confirm');
    }, [validateForm]);

    const handlePlaceOrder = useCallback(async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, items: items.map(i => ({ variantId: i.variantId, qty: i.qty })) }),
            });
            const data = await res.json();
            if (data.order) {
                clearCart();
                window.location.href = `/orders/${data.order.id}`;
            } else {
                alert(data.error || 'Có lỗi xảy ra');
            }
        } catch {
            alert('Không thể đặt hàng. Vui lòng thử lại.');
        }
        setSubmitting(false);
    }, [form, items, clearCart]);

    if (items.length === 0) {
        return (
            <div className="container animate-in">
                <div className="empty-state" style={{ paddingTop: 'var(--space-16)' }}>
                    <div className="empty-state__icon">🛒</div>
                    <h3 className="empty-state__title">Chưa có sản phẩm</h3>
                    <p className="empty-state__desc">Thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <Link href="/search" className="btn btn-primary" style={{ marginTop: 'var(--space-4)', minHeight: 44 }}>
                        Mua sắm ngay →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 120 }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                Thanh toán
            </h1>

            {/* Step progress bar */}
            <div className="sf-steps">
                <div className={`sf-step ${step === 'info' ? 'sf-step--active' : 'sf-step--done'}`} />
                <div className={`sf-step ${step === 'confirm' ? 'sf-step--active' : ''}`} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)', marginTop: '-var(--space-4)' }}>
                <span style={{ fontWeight: step === 'info' ? 700 : 400, color: step === 'info' ? 'var(--gold-400)' : undefined }}>1. Thông tin</span>
                <span style={{ fontWeight: step === 'confirm' ? 700 : 400, color: step === 'confirm' ? 'var(--gold-400)' : undefined }}>2. Xác nhận</span>
            </div>

            {/* ═══ Step 1: Info + Shipping + Payment ═══ */}
            {step === 'info' && (
                <div ref={formRef} className="animate-in" style={{ maxWidth: 600 }}>
                    {/* Address */}
                    <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>📍 Địa chỉ nhận hàng</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <div className="sf-form-group">
                                <label>Họ tên *</label>
                                <input name="name" className={`input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => updateField('name', e.target.value)} placeholder="Nguyễn Văn A" autoComplete="name" />
                                {errors.name && <span className="sf-form-error">{errors.name}</span>}
                            </div>
                            <div className="sf-form-group">
                                <label>Số điện thoại *</label>
                                <input name="phone" className={`input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => updateField('phone', e.target.value)} placeholder="0912 345 678" type="tel" autoComplete="tel" inputMode="tel" />
                                {errors.phone && <span className="sf-form-error">{errors.phone}</span>}
                            </div>
                        </div>
                        <div className="sf-form-group">
                            <label>Email (tuỳ chọn)</label>
                            <input name="email" className={`input ${errors.email ? 'error' : ''}`} value={form.email} onChange={e => updateField('email', e.target.value)} placeholder="email@example.com" type="email" autoComplete="email" />
                            {errors.email && <span className="sf-form-error">{errors.email}</span>}
                        </div>
                        <div className="sf-form-group">
                            <label>Địa chỉ *</label>
                            <input name="address" className={`input ${errors.address ? 'error' : ''}`} value={form.address} onChange={e => updateField('address', e.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" autoComplete="street-address" />
                            {errors.address && <span className="sf-form-error">{errors.address}</span>}
                        </div>
                        <div className="sf-form-group" style={{ marginBottom: 0 }}>
                            <label>Ghi chú</label>
                            <textarea className="input" rows={2} value={form.note} onChange={e => updateField('note', e.target.value)} placeholder="Ghi chú cho đơn hàng..." />
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>🚚 Vận chuyển</h3>
                        {[
                            { id: 'standard', name: 'Tiêu chuẩn (3-5 ngày)', price: sub >= 500000 ? 0 : 30000 },
                            { id: 'express', name: 'Nhanh (1-2 ngày)', price: 50000 },
                        ].map((opt) => (
                            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 'var(--touch-target)', background: form.shipping === opt.id ? 'var(--bg-secondary)' : 'transparent', marginBottom: 'var(--space-1)' }}>
                                <input type="radio" name="shipping" checked={form.shipping === opt.id} onChange={() => updateField('shipping', opt.id)} style={{ width: 20, height: 20, accentColor: 'var(--gold-400)' }} />
                                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500 }}>{opt.name}</span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: opt.price === 0 ? '#22c55e' : 'var(--gold-400)' }}>
                                    {opt.price === 0 ? 'Miễn phí ✨' : formatVND(opt.price)}
                                </span>
                            </label>
                        ))}
                    </div>

                    {/* Payment */}
                    <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>💳 Thanh toán</h3>
                        {[
                            { id: 'COD', name: 'Thanh toán khi nhận hàng', icon: '💵' },
                            { id: 'BANK_TRANSFER', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
                            { id: 'VNPAY', name: 'VNPAY', icon: '💳' },
                            { id: 'MOMO', name: 'Ví MoMo', icon: '📱' },
                        ].map((opt) => (
                            <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', minHeight: 'var(--touch-target)', background: form.payment === opt.id ? 'var(--bg-secondary)' : 'transparent', marginBottom: 'var(--space-1)' }}>
                                <input type="radio" name="payment" checked={form.payment === opt.id} onChange={() => updateField('payment', opt.id)} style={{ width: 20, height: 20, accentColor: 'var(--gold-400)' }} />
                                <span style={{ fontSize: 18 }}>{opt.icon}</span>
                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{opt.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Step 2: Confirm ═══ */}
            {step === 'confirm' && (
                <div className="animate-in" style={{ maxWidth: 600 }}>
                    {/* Order summary */}
                    <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>📋 Đơn hàng</h3>
                        {items.map((item) => (
                            <div key={item.variantId} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                                <div style={{ width: 48, height: 48, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👓</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.productName}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.frameColor} · SL: {item.qty}</p>
                                </div>
                                <span style={{ color: 'var(--gold-400)', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatVND(item.price * item.qty)}</span>
                            </div>
                        ))}
                        <div className="divider" />
                        <div style={{ fontSize: 'var(--text-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-tertiary)' }}>Tạm tính</span><span>{formatVND(sub)}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>Vận chuyển</span>
                                <span style={{ color: shippingCost === 0 ? '#22c55e' : 'inherit' }}>{shippingCost === 0 ? 'Miễn phí ✨' : formatVND(shippingCost)}</span>
                            </div>
                            <div className="divider" style={{ margin: 'var(--space-1) 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 700 }}>Tổng cộng</span>
                                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--gold-400)' }}>{formatVND(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping info summary */}
                    <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                            <span style={{ fontWeight: 700 }}>📍 Giao đến</span>
                            <button onClick={() => setStep('info')} style={{ background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600 }}>Sửa</button>
                        </div>
                        <p>{form.name} · {form.phone}</p>
                        <p style={{ color: 'var(--text-tertiary)' }}>{form.address}</p>
                        <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                            {form.shipping === 'express' ? '🚚 Giao nhanh' : '📦 Tiêu chuẩn'} · {form.payment === 'COD' ? '💵 COD' : form.payment}
                        </p>
                    </div>

                    <button onClick={() => setStep('info')} className="btn" style={{ width: '100%', marginBottom: 'var(--space-3)', minHeight: 44 }}>
                        ← Quay lại chỉnh sửa
                    </button>
                </div>
            )}

            {/* Sticky CTA Bar */}
            <div className="sticky-cta-bar visible">
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tổng cộng</p>
                    <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--gold-400)' }}>
                        {formatVND(total)}
                    </p>
                </div>
                {step === 'info' ? (
                    <button className="btn btn-primary" style={{ flex: 1, maxWidth: 220, minHeight: 44, fontWeight: 700, fontSize: 'var(--text-base)' }} onClick={goToConfirm}>
                        Tiếp tục →
                    </button>
                ) : (
                    <button className="btn btn-primary" style={{ flex: 1, maxWidth: 220, minHeight: 44, fontWeight: 700, fontSize: 'var(--text-base)' }} onClick={handlePlaceOrder} disabled={submitting}>
                        {submitting ? '⏳ Đang xử lý...' : '✅ Đặt hàng'}
                    </button>
                )}
            </div>
        </div>
    );
}
