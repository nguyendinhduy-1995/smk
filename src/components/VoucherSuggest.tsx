'use client';

import { useState } from 'react';

const VOUCHERS = [
    { code: 'WELCOME10', desc: 'Giảm 10% đơn đầu tiên', minOrder: 0, discount: 10, type: 'percent' as const },
    { code: 'SHIP0', desc: 'Miễn phí vận chuyển', minOrder: 300000, discount: 0, type: 'shipping' as const },
    { code: 'COMBO15', desc: 'Giảm 15% mua combo gọng + tròng', minOrder: 2000000, discount: 15, type: 'percent' as const },
];

interface VoucherSuggestProps {
    orderTotal: number;
    onApply: (code: string) => void;
}

export default function VoucherSuggest({ orderTotal, onApply }: VoucherSuggestProps) {
    const [input, setInput] = useState('');
    const [applied, setApplied] = useState<string | null>(null);

    // Find best voucher for current order
    const bestVoucher = VOUCHERS.filter(v => orderTotal >= v.minOrder)
        .sort((a, b) => b.discount - a.discount)[0];

    const handleApply = (code: string) => {
        setApplied(code);
        onApply(code);
    };

    return (
        <div className="card" style={{ padding: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>🎟️ Mã giảm giá</p>

            {/* Manual input */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <input
                    className="input"
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    style={{ flex: 1, fontSize: 14, minHeight: 40 }}
                />
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleApply(input)}
                    disabled={!input}
                    style={{ minHeight: 40, whiteSpace: 'nowrap' }}
                >
                    Áp dụng
                </button>
            </div>

            {/* Best voucher suggestion */}
            {bestVoucher && !applied && (
                <button
                    onClick={() => handleApply(bestVoucher.code)}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                        background: 'rgba(212,168,83,0.08)', border: '1px dashed rgba(212,168,83,0.3)',
                        cursor: 'pointer', textAlign: 'left',
                    }}
                >
                    <span style={{ fontSize: 20 }}>🏷️</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-400)' }}>{bestVoucher.code}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{bestVoucher.desc}</p>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>Áp dụng →</span>
                </button>
            )}

            {applied && (
                <p style={{ fontSize: 'var(--text-xs)', color: '#22c55e', fontWeight: 600 }}>
                    ✅ Đã áp dụng mã: {applied}
                </p>
            )}
        </div>
    );
}
