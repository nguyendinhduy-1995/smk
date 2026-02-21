'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const register = useAuthStore((s) => s.register);
    const user = useAuthStore((s) => s.user);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const router = useRouter();

    useEffect(() => { fetchMe(); }, [fetchMe]);
    useEffect(() => { if (user) router.replace('/account'); }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        const result = await register(name, phone, password);
        if (result.success) {
            router.push('/account');
        } else {
            setError(result.error || 'Đăng ký thất bại');
        }
        setLoading(false);
    };

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
                    {error && (
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: '#ef4444',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Họ và tên *</label>
                        <input className="input" type="text" placeholder="Nguyễn Văn A" required value={name} onChange={(e) => setName(e.target.value)} autoFocus style={{ minHeight: 48 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Số điện thoại *</label>
                        <input className="input" type="tel" placeholder="0912 345 678" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ minHeight: 48 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Mật khẩu *</label>
                        <input className="input" type="password" placeholder="Ít nhất 6 ký tự" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ minHeight: 48 }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Xác nhận mật khẩu *</label>
                        <input className="input" type="password" placeholder="Nhập lại mật khẩu" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ minHeight: 48 }} />
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
                    Đã có tài khoản? <Link href="/login" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Đăng nhập</Link>
                </p>

                {/* Benefits */}
                <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <p style={{ fontWeight: 600, marginBottom: 4 }}>🎁 Quyền lợi thành viên:</p>
                    <p>Tích điểm • Theo dõi đơn hàng • Ưu đãi riêng • Lưu địa chỉ</p>
                </div>
            </div>
        </div>
    );
}
