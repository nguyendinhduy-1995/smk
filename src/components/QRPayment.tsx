'use client';

import { useState } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const QR_METHODS = [
    { id: 'vnpay', name: 'VNPay QR', icon: '🏦', color: '#005BAA' },
    { id: 'momo', name: 'MoMo', icon: '💜', color: '#A50064' },
    { id: 'zalopay', name: 'ZaloPay', icon: '💙', color: '#0068FF' },
];

interface QRPaymentProps {
    amount: number;
    orderId: string;
}

export default function QRPayment({ amount, orderId }: QRPaymentProps) {
    const [selected, setSelected] = useState('vnpay');
    const [status, setStatus] = useState<'pending' | 'checking' | 'success'>('pending');

    const handleCheck = () => {
        setStatus('checking');
        setTimeout(() => setStatus('pending'), 3000); // simulate check
    };

    return (
        <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                📱 Thanh toán QR
            </h3>

            {/* Method selector */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                {QR_METHODS.map(m => (
                    <button
                        key={m.id}
                        className={`sf-chip ${selected === m.id ? 'sf-chip--active' : ''}`}
                        onClick={() => setSelected(m.id)}
                        style={{ gap: 4 }}
                    >
                        <span>{m.icon}</span> {m.name}
                    </button>
                ))}
            </div>

            {/* QR placeholder */}
            <div style={{
                width: 200, height: 200, margin: '0 auto var(--space-4)',
                background: '#fff', borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 'var(--space-2)',
            }}>
                <span style={{ fontSize: 48 }}>📱</span>
                <span style={{ fontSize: 12, color: '#333', fontWeight: 600 }}>QR {QR_METHODS.find(m => m.id === selected)?.name}</span>
            </div>

            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--gold-400)', marginBottom: 'var(--space-2)' }}>
                {formatVND(amount)}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                Mã đơn: {orderId}
            </p>

            <button
                className="btn btn-primary btn-lg"
                onClick={handleCheck}
                disabled={status === 'checking'}
                style={{ width: '100%', minHeight: 48 }}
            >
                {status === 'checking' ? '⏳ Đang kiểm tra...' : '✅ Tôi đã thanh toán'}
            </button>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử
            </p>
        </div>
    );
}
