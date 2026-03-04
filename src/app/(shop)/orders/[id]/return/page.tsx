'use client';

import { useState } from 'react';

const RETURN_TYPES = [
    { value: 'RETURN', label: ' Hoàn trả', desc: 'Trả sản phẩm và nhận hoàn tiền' },
    { value: 'EXCHANGE', label: '🔄 Đổi hàng', desc: 'Đổi sang sản phẩm/size khác' },
    { value: 'WARRANTY', label: '🔧 Bảo hành', desc: 'Sửa chữa hoặc thay thế theo bảo hành' },
];

const REASONS = [
    'Sản phẩm bị lỗi/hỏng',
    'Không đúng mô tả trên web',
    'Nhận sai sản phẩm',
    'Não/gọng không vừa',
    'Tròng sai độ cận/loạn',
    'Đổi ý, không cần nữa',
    'Khác',
];

export default function ReturnRequestPage({ params }: { params: { id: string } }) {
    const [type, setType] = useState('');
    const [reason, setReason] = useState('');
    const [detail, setDetail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const orderId = params.id;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8) var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>✅</div>
                <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Yêu cầu đã gửi thành công!</h1>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    Đơn #{orderId} — Chúng tôi sẽ xem xét và phản hồi trong vòng 24 giờ.
                </p>
                <div className="card" style={{ padding: 'var(--space-4)', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Loại yêu cầu:</span>
                        <span>{RETURN_TYPES.find(t => t.value === type)?.label}</span>
                        <span style={{ color: 'var(--text-muted)' }}>Lý do:</span>
                        <span>{reason}</span>
                        {detail && <><span style={{ color: 'var(--text-muted)' }}>Chi tiết:</span><span>{detail}</span></>}
                    </div>
                </div>
                <a href={`/orders/${orderId}`} style={{ display: 'inline-block', marginTop: 'var(--space-4)', color: 'var(--gold-400)', fontSize: 'var(--text-sm)', textDecoration: 'underline' }}>
                    ← Quay lại đơn hàng
                </a>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-1)' }}> Yêu cầu đổi trả / bảo hành</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Đơn hàng: <strong style={{ color: 'var(--gold-400)' }}>#{orderId}</strong>
            </p>

            <form onSubmit={handleSubmit}>
                {/* Return type */}
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Loại yêu cầu *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
                    {RETURN_TYPES.map(t => (
                        <label key={t.value} className="card" style={{
                            padding: 'var(--space-3) var(--space-4)', cursor: 'pointer',
                            border: type === t.value ? '2px solid var(--gold-400)' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                        }}>
                            <input type="radio" name="type" value={t.value} checked={type === t.value}
                                onChange={() => setType(t.value)} style={{ accentColor: 'var(--gold-400)' }} />
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{t.label}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>

                {/* Reason */}
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Lý do *</label>
                <select value={reason} onChange={e => setReason(e.target.value)} required
                    style={{
                        width: '100%', padding: '10px 14px', marginBottom: 'var(--space-5)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                    }}>
                    <option value="">— Chọn lý do —</option>
                    {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                {/* Detail */}
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Mô tả chi tiết</label>
                <textarea value={detail} onChange={e => setDetail(e.target.value)} rows={4} placeholder="Mô tả thêm về vấn đề bạn gặp phải..."
                    style={{
                        width: '100%', padding: '10px 14px', marginBottom: 'var(--space-3)',
                        background: 'var(--bg-tertiary)', color: 'var(--text-primary)',
                        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)', resize: 'vertical',
                    }} />

                {/* Photo upload placeholder */}
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Ảnh sản phẩm (tuỳ chọn)</label>
                <div className="card" style={{
                    padding: 'var(--space-6)', textAlign: 'center', marginBottom: 'var(--space-5)',
                    border: '2px dashed var(--border-primary)', cursor: 'pointer',
                }}>
                    <div style={{ fontSize: 32, marginBottom: 'var(--space-2)' }}>📷</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Chụp hoặc tải ảnh sản phẩm</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>Tối đa 5 ảnh, mỗi ảnh &lt; 10MB</div>
                </div>

                {/* Policy */}
                <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)', alignItems: 'start' }}>
                    <span style={{ fontSize: 18 }}>📋</span>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>Chính sách:</strong> Đổi trả trong 7 ngày, sản phẩm còn nguyên tem/hộp.
                        Bảo hành gọng 6 tháng, tròng 12 tháng. Xử lý trong 24h làm việc.
                    </div>
                </div>

                <button type="submit" disabled={!type || !reason} className="btn btn-primary"
                    style={{
                        width: '100%', padding: '14px', fontSize: 'var(--text-sm)',
                        opacity: (!type || !reason) ? 0.5 : 1,
                    }}>
                    📤 Gửi yêu cầu
                </button>
            </form>
        </div>
    );
}
