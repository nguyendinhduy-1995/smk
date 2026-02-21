'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [method, setMethod] = useState<'phone' | 'email'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate OTP send
        await new Promise((r) => setTimeout(r, 1000));
        setStep('otp');
        setLoading(false);
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1000));
        // TODO: verify OTP and create session
        window.location.href = '/account';
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

                {/* Method Tabs */}
                <div className="tabs" style={{ marginBottom: 'var(--space-5)' }}>
                    <button className={`tab ${method === 'phone' ? 'tab--active' : ''}`} onClick={() => { setMethod('phone'); setStep('input'); }}>📱 Số điện thoại</button>
                    <button className={`tab ${method === 'email' ? 'tab--active' : ''}`} onClick={() => { setMethod('email'); setStep('input'); }}>✉️ Email</button>
                </div>

                {step === 'input' ? (
                    <form onSubmit={handleSendOTP}>
                        {method === 'phone' ? (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Số điện thoại</label>
                                <input className="input" type="tel" placeholder="0912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} required autoFocus />
                            </div>
                        ) : (
                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>Email</label>
                                <input className="input" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                            </div>
                        )}
                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%' }}>
                            {loading ? '⏳ Đang gửi...' : '📩 Gửi mã OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                            Mã OTP đã gửi đến <strong style={{ color: 'var(--gold-400)' }}>{method === 'phone' ? phone : email}</strong>
                        </p>
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <input className="input" type="text" placeholder="Nhập mã 6 số" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus
                                style={{ textAlign: 'center', fontSize: 'var(--text-xl)', letterSpacing: '0.5em', fontWeight: 700 }} />
                        </div>
                        <button className="btn btn-primary btn-lg" type="submit" disabled={loading || otp.length < 6} style={{ width: '100%' }}>
                            {loading ? '⏳ Đang xác thực...' : '✓ Xác nhận'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setStep('input')} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                            ← Quay lại
                        </button>
                    </form>
                )}

                <div className="divider" />

                {/* #5 — Social Login with real brand SVGs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Đăng nhập bằng Facebook
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Đăng nhập bằng Google
                    </button>
                    <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0068FF"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.49a.96.96 0 01-1.36.6l-3.32-2.08-1.76 1.7a.32.32 0 01-.52-.16l-.64-3.84-3.52-1.16a.48.48 0 01.04-.92l11.52-4.48a.64.64 0 01.84.84z" /></svg>
                        Đăng nhập bằng Zalo
                    </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-5)' }}>
                    Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--gold-400)' }}>Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}
