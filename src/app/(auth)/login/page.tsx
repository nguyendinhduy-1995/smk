'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

const SOCIAL_ERROR_MESSAGES: Record<string, string> = {
    google_failed: 'Đăng nhập Google thất bại',
    google_token: 'Không thể xác thực với Google',
    google_error: 'Lỗi kết nối Google',
    facebook_failed: 'Đăng nhập Facebook thất bại',
    facebook_token: 'Không thể xác thực với Facebook',
    facebook_error: 'Lỗi kết nối Facebook',
    zalo_failed: 'Đăng nhập Zalo thất bại',
    zalo_token: 'Không thể xác thực với Zalo',
    zalo_error: 'Lỗi kết nối Zalo',
};

function LoginForm() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((s) => s.login);
    const user = useAuthStore((s) => s.user);
    const fetchMe = useAuthStore((s) => s.fetchMe);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => { fetchMe(); }, [fetchMe]);
    useEffect(() => { if (user) router.replace('/account'); }, [user, router]);

    useEffect(() => {
        const errKey = searchParams.get('error');
        if (errKey && SOCIAL_ERROR_MESSAGES[errKey]) {
            setError(SOCIAL_ERROR_MESSAGES[errKey]);
        }
    }, [searchParams]);

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

            {/* Social Login */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                <a href="/api/auth/google" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 44 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Đăng nhập bằng Google
                </a>
                <a href="/api/auth/facebook" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 44 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Đăng nhập bằng Facebook
                </a>
                <a href="/api/auth/zalo" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', minHeight: 44 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0068FF"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.49a.96.96 0 01-1.36.6l-3.32-2.08-1.76 1.7a.32.32 0 01-.52-.16l-.64-3.84-3.52-1.16a.48.48 0 01.04-.92l11.52-4.48a.64.64 0 01.84.84z" /></svg>
                    Đăng nhập bằng Zalo
                </a>
            </div>

            <div className="divider" />

            {/* Phone + Password */}
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
                    <input className="input" type="tel" placeholder="0912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} required style={{ minHeight: 48 }} />
                </div>

                <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Mật khẩu</label>
                    <input className="input" type="password" placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ minHeight: 48 }} />
                </div>

                <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>
                Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--gold-400)', fontWeight: 600 }}>Đăng ký ngay</Link>
            </p>
            <div style={{ textAlign: 'center', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                🔒 Thông tin được bảo mật tuyệt đối
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
            <Suspense fallback={<div style={{ color: 'var(--text-muted)' }}>Đang tải...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
