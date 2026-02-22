'use client';

import { useState } from 'react';
import Link from 'next/link';

const SERVICES = [
    { id: 'try', icon: '👓', label: 'Thử kính', duration: '30 phút', desc: 'Trải nghiệm và thử gọng kính tại cửa hàng' },
    { id: 'eye', icon: '👁️', label: 'Đo thị lực', duration: '20 phút', desc: 'Kiểm tra thị lực miễn phí với chuyên gia' },
    { id: 'fix', icon: '🔧', label: 'Sửa kính', duration: '15 phút', desc: 'Sửa gọng, thay ốc, chỉnh kính miễn phí' },
    { id: 'lens', icon: '💎', label: 'Tư vấn tròng', duration: '30 phút', desc: 'Tư vấn tròng cận/loạn/đa tròng chuyên sâu' },
];

const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30',
];

export default function BookingPage() {
    const [service, setService] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');
    const [step, setStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const maxDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    const canNext = step === 0 ? !!service : step === 1 ? (!!date && !!time) : (name.trim().length >= 2 && phone.trim().length >= 9);

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (submitted) {
        const svc = SERVICES.find(s => s.id === service);
        return (
            <div className="container animate-in" style={{ paddingTop: 'var(--space-8)', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
                <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>✅</div>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Đặt lịch thành công!</h1>
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'left', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Dịch vụ:</span> <strong>{svc?.icon} {svc?.label}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Ngày:</span> <strong>{new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Giờ:</span> <strong>{time}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Họ tên:</span> <strong>{name}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>SĐT:</span> <strong>{phone}</strong></div>
                        {note && <div><span style={{ color: 'var(--text-muted)' }}>Ghi chú:</span> {note}</div>}
                    </div>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    SMK sẽ gửi xác nhận qua Zalo/SMS. Vui lòng đến đúng giờ 🕐
                </p>
                <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>← Về trang chủ</Link>
            </div>
        );
    }

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', maxWidth: 520, margin: '0 auto' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>📅 Đặt lịch hẹn</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Đặt lịch tại Siêu Thị Mắt Kính — phục vụ chuyên nghiệp, không cần chờ đợi
            </p>

            {/* Stepper */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-6)' }}>
                {['Dịch vụ', 'Ngày & giờ', 'Thông tin'].map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{
                            height: 4, borderRadius: 2, marginBottom: 6,
                            background: i <= step ? 'var(--gold-400)' : 'var(--bg-tertiary)',
                            transition: 'background 0.3s',
                        }} />
                        <span style={{ fontSize: 10, fontWeight: i === step ? 700 : 400, color: i <= step ? 'var(--gold-400)' : 'var(--text-muted)' }}>{s}</span>
                    </div>
                ))}
            </div>

            {/* Step 1: Service */}
            {step === 0 && (
                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    {SERVICES.map(s => (
                        <button key={s.id} onClick={() => setService(s.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-lg)', textAlign: 'left', cursor: 'pointer',
                                background: service === s.id ? 'rgba(212,168,83,0.08)' : 'var(--bg-secondary)',
                                border: service === s.id ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                color: 'var(--text-primary)', transition: 'all 0.15s',
                            }}>
                            <span style={{ fontSize: 28 }}>{s.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.label}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                            </div>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>⏱ {s.duration}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 1 && (
                <div>
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8, display: 'block' }}>📅 Chọn ngày</label>
                    <input type="date" value={date} min={today} max={maxDate}
                        onChange={e => setDate(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)',
                        }} />
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8, display: 'block' }}>🕐 Chọn giờ</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {TIME_SLOTS.map(t => (
                            <button key={t} onClick={() => setTime(t)}
                                style={{
                                    padding: '10px 0', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 13,
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    background: time === t ? 'var(--gold-400)' : 'var(--bg-secondary)',
                                    color: time === t ? '#0a0a0f' : 'var(--text-primary)',
                                    border: time === t ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                }}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Info */}
            {step === 2 && (
                <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Họ và tên *</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Nguyễn Văn A"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Số điện thoại *</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912 345 678"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6, display: 'block' }}>Ghi chú</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="VD: Tôi muốn thử mẫu Aviator Gold..."
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--text-base)', resize: 'vertical' }} />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                {step > 0 && (
                    <button className="btn" onClick={() => setStep(step - 1)} style={{ minWidth: 100 }}>← Quay lại</button>
                )}
                <div style={{ flex: 1 }} />
                {step < 2 ? (
                    <button className="btn btn-primary" onClick={() => setStep(step + 1)} disabled={!canNext}
                        style={{ minWidth: 140, fontWeight: 700 }}>
                        Tiếp tục →
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={!canNext}
                        style={{ minWidth: 160, fontWeight: 700 }}>
                        ✅ Xác nhận đặt lịch
                    </button>
                )}
            </div>
        </div>
    );
}
