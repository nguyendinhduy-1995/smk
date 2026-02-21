'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const user = useAuthStore((s) => s.user);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const router = useRouter();

    useEffect(() => { fetchMe(); }, [fetchMe]);
    useEffect(() => { if (user) router.replace('/account'); }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(phone, password);
        if (result.success) {
            router.push('/account');
        } else {
            setError(result.error || 'Đăng nhập thất bại');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <div className="card animate-in" style={{ width: '100%', maxWidth: 420, padding: 'var(--space-8)' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        SMK ✦
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                        Đăng nhập vào tài khoản
                    </p>
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
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Số điện thoại</label>
                        <input
                            className="input"
                            type="tel"
                            placeholder="0912 345 678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            autoFocus
                            style={{ minHeight: 48 }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Mật khẩu</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ minHeight: 48 }}
                        />
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
                        {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="divider" />

                <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Đăng ký ngay</Link>
                </p>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    🔒 Thông tin được bảo mật tuyệt đối
                </div>
            </div>
        </div>
    );
}
