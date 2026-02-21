'use client';

import { useState } from 'react';

export default function PartnerStorePage() {
    const PARTNER_CODE = 'DUY123';
    const [banner, setBanner] = useState('linear-gradient(135deg, rgba(212,168,83,0.15), rgba(96,165,250,0.08))');
    const [desc, setDesc] = useState('Chuyên gọng kính thời trang cao cấp. Tư vấn miễn phí, ship toàn quốc.');
    const [hours, setHours] = useState('08:00 - 21:00');
    const [address, setAddress] = useState('123 Nguyễn Huệ, Q.1, TP.HCM');
    const [phone, setPhone] = useState('0909 123 456');
    const [toast, setToast] = useState('');
    const [tab, setTab] = useState<'preview' | 'settings' | 'products'>('preview');

    const BANNERS = [
        'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(96,165,250,0.08))',
        'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(96,165,250,0.08))',
        'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(212,168,83,0.06))',
        'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(212,168,83,0.08))',
        'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(168,85,247,0.05))',
    ];

    const FEATURED = [
        { name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: '2.990.000₫', slug: 'aviator-classic-gold', rating: 4.8, sold: 42 },
        { name: 'Cat-Eye Acetate', brand: 'Tom Ford', price: '4.590.000₫', slug: 'cat-eye-acetate', rating: 4.9, sold: 28 },
        { name: 'Square TR90 Black', brand: 'Oakley', price: '3.290.000₫', slug: 'square-tr90', rating: 4.7, sold: 35 },
    ];

    const REVIEWS = [
        { name: 'Trần Mai', rating: 5, text: 'Kính đẹp, giao nhanh, đóng gói cẩn thận. Rất hài lòng!', date: '18/02/2026' },
        { name: 'Phạm Minh', rating: 5, text: 'Tư vấn nhiệt tình, chọn đúng gọng hợp mặt. Cảm ơn!', date: '15/02/2026' },
        { name: 'Lê Hoa', rating: 4, text: 'Giá tốt, hàng chính hãng. Ship hơi lâu nhưng ổn.', date: '10/02/2026' },
    ];

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            {toast && <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 999, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(34,197,94,0.9)', color: '#fff', fontSize: 13, fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 4 }}>🏪 Cửa hàng cá nhân</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 'var(--space-4)' }}>
                Mini-store tại <code style={{ color: 'var(--gold-400)' }}>/store/{PARTNER_CODE}</code>
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-4)' }}>
                {([['preview', '👁️ Xem trước'], ['settings', '⚙️ Cài đặt'], ['products', '👓 SP nổi bật']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)} className="btn btn-sm"
                        style={{ background: tab === key ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)', color: tab === key ? 'var(--gold-400)' : 'var(--text-muted)', border: tab === key ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Preview */}
            {tab === 'preview' && (
                <>
                    <div className="glass-card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)', background: banner }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0a0a0f' }}>D</div>
                            <div>
                                <p style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>Đại lý Duy</p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>🏆 AGENT · 42 đơn · ⭐ 4.8</p>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                            <span>🕐 {hours}</span>
                            <span>📍 {address}</span>
                        </div>
                    </div>

                    {/* Featured products */}
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>🌟 Sản phẩm nổi bật</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 'var(--space-4)' }}>
                        {FEATURED.map(p => (
                            <div key={p.slug} className="card" style={{ padding: 12 }}>
                                <div style={{ width: '100%', height: 80, background: 'var(--bg-tertiary)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 8 }}>👓</div>
                                <div style={{ fontSize: 10, color: 'var(--gold-400)', fontWeight: 600 }}>{p.brand}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                                    <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>{p.price}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>⭐{p.rating} · {p.sold} sold</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reviews */}
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>⭐ Đánh giá từ khách hàng</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-4)' }}>
                        {REVIEWS.map((r, i) => (
                            <div key={i} className="card" style={{ padding: 12, display: 'flex', gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{r.name[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 700 }}>{r.name}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.date}</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: '#fbbf24', marginBottom: 4 }}>{'⭐'.repeat(r.rating)}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{r.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Google Maps placeholder */}
                    <div className="card" style={{ padding: 12, marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📍 Vị trí cửa hàng</h3>
                        <div style={{ width: '100%', height: 150, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                            🗺️ Google Maps — {address}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>📞 {phone}</p>
                    </div>
                </>
            )}

            {/* Settings */}
            {tab === 'settings' && (
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>⚙️ Tuỳ chỉnh cửa hàng</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Banner</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                                {BANNERS.map((b, i) => (
                                    <button key={i} onClick={() => setBanner(b)} style={{ width: 40, height: 40, borderRadius: 8, background: b, border: banner === b ? '2px solid var(--gold-400)' : '2px solid transparent', cursor: 'pointer' }} />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Mô tả</label>
                            <textarea className="input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Giờ mở cửa</label>
                                <input className="input" value={hours} onChange={e => setHours(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Điện thoại</label>
                                <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Địa chỉ</label>
                            <input className="input" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => showToast('✅ Đã lưu!')}>💾 Lưu thay đổi</button>
                    </div>
                </div>
            )}

            {/* Products */}
            {tab === 'products' && (
                <div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Chọn SP hiển thị trên cửa hàng cá nhân</p>
                    {FEATURED.map(p => (
                        <div key={p.slug} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>👓</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.brand} · {p.price}</div>
                            </div>
                            <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'none', fontSize: 10 }}>✅ Hiển thị</button>
                        </div>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📊 Thống kê cửa hàng</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {[
                        { label: 'Lượt xem', value: '1,245', icon: '👁️' },
                        { label: 'Đơn hàng', value: '42', icon: '📦' },
                        { label: 'Tỷ lệ mua', value: '3.4%', icon: '🎯' },
                        { label: 'Đánh giá', value: '4.8⭐', icon: '⭐' },
                    ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
                            <div style={{ fontSize: 16 }}>{s.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-400)' }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
