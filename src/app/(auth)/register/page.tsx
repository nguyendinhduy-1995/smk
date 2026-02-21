'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setDone(true);
        setLoading(false);
    };

    if (done) {
        return (
            <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
                <div className="card animate-in" style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)', textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 'var(--space-4)' }}>🎉</div>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Đăng ký thành công!</h2>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                        Chào mừng {form.name} đến Siêu Thị Mắt Kính! Mã OTP đã gửi đến {form.phone || form.email}.
                    </p>
                    <Link href="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Đăng nhập ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <div className="card animate-in" style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SMK ✦
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>Tạo tài khoản mới</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                        <input className="input" type="text" placeholder="Nguyễn Văn A" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Số điện thoại *</label>
                        <input className="input" type="tel" placeholder="0912 345 678" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Email (tuỳ chọn)</label>
                        <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <div className="divider" style={{ margin: 'var(--space-2) 0' }} />

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Bằng việc đăng ký, bạn đồng ý với <a href="#" style={{ color: 'var(--gold-400)' }}>Điều khoản dịch vụ</a> và <a href="#" style={{ color: 'var(--gold-400)' }}>Chính sách bảo mật</a>.
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? '⏳ Đang tạo...' : '🚀 Đăng ký'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>
                    Đã có tài khoản? <Link href="/login" style={{ color: 'var(--gold-400)' }}>Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
