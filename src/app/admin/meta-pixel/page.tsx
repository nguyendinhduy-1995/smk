'use client';

import { useState, useEffect } from 'react';

interface PixelConfig {
    pixelId: string;
    accessToken: string;
    accessTokenSet: boolean;
    enabled: boolean;
    events: Record<string, boolean>;
    updatedAt: string;
}

interface GAConfig {
    gaId: string;
    enabled: boolean;
    updatedAt: string;
}

const DEFAULT_PIXEL: PixelConfig = {
    pixelId: '', accessToken: '', accessTokenSet: false, enabled: true,
    events: {
        PageView: true, ViewContent: true, AddToCart: true, AddToWishlist: true,
        InitiateCheckout: true, AddPaymentInfo: true, Purchase: true, Search: true, Contact: true,
    },
    updatedAt: '',
};

const EVENT_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
    PageView: { label: 'PageView', desc: 'Khi người dùng xem trang', icon: '' },
    ViewContent: { label: 'ViewContent', desc: 'Khi xem chi tiết sản phẩm', icon: '' },
    AddToCart: { label: 'AddToCart', desc: 'Khi thêm vào giỏ hàng', icon: '' },
    AddToWishlist: { label: 'AddToWishlist', desc: 'Khi thêm yêu thích', icon: '' },
    InitiateCheckout: { label: 'InitiateCheckout', desc: 'Khi bắt đầu thanh toán', icon: '' },
    AddPaymentInfo: { label: 'AddPaymentInfo', desc: 'Khi nhập phương thức thanh toán', icon: '' },
    Purchase: { label: 'Purchase', desc: 'Khi hoàn tất mua hàng', icon: '' },
    Search: { label: 'Search', desc: 'Khi tìm kiếm sản phẩm', icon: '' },
    Contact: { label: 'Contact', desc: 'Khi liên hệ / tư vấn', icon: '' },
};

export default function MetaPixelPage() {
    const [tab, setTab] = useState<'pixel' | 'capi' | 'ga' | 'events'>('pixel');
    const [config, setConfig] = useState<PixelConfig>(DEFAULT_PIXEL);
    const [gaConfig, setGaConfig] = useState<GAConfig>({ gaId: '', enabled: true, updatedAt: '' });
    const [newToken, setNewToken] = useState('');
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/meta-pixel').then(r => r.ok ? r.json() : null),
            fetch('/api/admin/settings/analytics').then(r => r.ok ? r.json() : null),
        ]).then(([pixelData, gaData]) => {
            if (pixelData) setConfig(pixelData);
            if (gaData) setGaConfig(gaData);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const savePixel = async () => {
        setSaving(true);
        try {
            const body: Record<string, unknown> = {
                pixelId: config.pixelId,
                enabled: config.enabled,
                events: config.events,
            };
            if (newToken) body.accessToken = newToken;
            const r = await fetch('/api/admin/meta-pixel', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (r.ok) {
                showToast('Đã lưu cấu hình Meta Pixel');
                setNewToken('');
                // Reload config
                const updated = await fetch('/api/admin/meta-pixel').then(r2 => r2.json());
                setConfig(updated);
            } else showToast('Lỗi khi lưu');
        } catch { showToast('Lỗi kết nối'); }
        setSaving(false);
    };

    const saveGA = async () => {
        setSaving(true);
        try {
            const r = await fetch('/api/admin/settings/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gaConfig) });
            if (r.ok) showToast('Đã lưu cấu hình Google Analytics');
            else showToast('Lỗi khi lưu');
        } catch { showToast('Lỗi kết nối'); }
        setSaving(false);
    };

    const testCAPI = async () => {
        setTesting(true); setTestResult(null);
        try {
            const r = await fetch('/api/admin/meta-pixel', { method: 'POST' });
            const data = await r.json();
            setTestResult({ success: data.success, message: data.success ? 'Test event gửi thành công! Kiểm tra trong Facebook Events Manager → Test Events.' : `Lỗi: ${JSON.stringify(data.error)}` });
        } catch { setTestResult({ success: false, message: 'Lỗi kết nối đến server' }); }
        setTesting(false);
    };

    if (loading) return (
        <div className="analytics-loading"><div className="analytics-loading__spinner" /><p>Đang tải cấu hình...</p></div>
    );

    return (
        <div className="analytics-page animate-in">
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 20px', borderRadius: 10, background: toast.includes('') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.includes('') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, backdropFilter: 'blur(10px)' }}>
                    {toast}
                </div>
            )}

            <div className="analytics-page__header">
                <div className="analytics-page__title-row">
                    <div>
                        <h1 className="analytics-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 28 }}></span> Tracking & Analytics
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Quản lý Meta Pixel, Conversions API và Google Analytics</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="analytics-tabs">
                {[
                    { key: 'pixel', label: 'Meta Pixel', icon: '' },
                    { key: 'capi', label: 'Conversions API', icon: '' },
                    { key: 'ga', label: 'Google Analytics', icon: '' },
                    { key: 'events', label: 'Sự kiện', icon: '' },
                ].map(t => (
                    <button key={t.key} className={`analytics-tab ${tab === t.key ? 'analytics-tab--active' : ''}`} onClick={() => setTab(t.key as typeof tab)}>
                        <span className="analytics-tab__icon">{t.icon}</span>
                        <span className="analytics-tab__label">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="analytics-tab-content">
                {/* ═══ Meta Pixel Tab ═══ */}
                {tab === 'pixel' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Pixel ID</h3>
                            <input type="text" value={config.pixelId} onChange={e => setConfig(p => ({ ...p, pixelId: e.target.value }))} placeholder="Nhập Meta Pixel ID (VD: 123456789012345)" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                                Lấy Pixel ID từ <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-400)' }}>Facebook Events Manager</a>
                            </p>
                        </div>

                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Cài đặt</h3>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Kích hoạt Pixel</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bật/tắt theo dõi Meta Pixel trên website</div></div>
                                <button onClick={() => setConfig(p => ({ ...p, enabled: !p.enabled }))} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', background: config.enabled ? '#22c55e' : 'var(--bg-tertiary)', position: 'relative', transition: 'all 200ms', flexShrink: 0 }}>
                                    <span style={{ position: 'absolute', top: 2, left: config.enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </button>
                            </div>
                        </div>

                        {/* Status */}
                        <div style={{ padding: '12px 16px', borderRadius: 10, background: config.enabled && config.pixelId ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${config.enabled && config.pixelId ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                            <span style={{ fontSize: 16 }}>{config.enabled && config.pixelId ? '' : ''}</span>
                            <span>{config.enabled && config.pixelId ? 'Meta Pixel đang hoạt động' : 'Meta Pixel chưa được kích hoạt'}</span>
                        </div>

                        <button onClick={savePixel} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-gold)', color: '#0a0a0f', fontWeight: 700, fontSize: 13, opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
                            {saving ? '⏳ Đang lưu...' : 'Lưu cấu hình Pixel'}
                        </button>
                    </div>
                )}

                {/* ═══ Conversions API Tab ═══ */}
                {tab === 'capi' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Conversions API (Server-side)</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                                CAPI gửi event từ server, không bị chặn bởi ad blocker. Kết hợp với Pixel để tăng accuracy.
                            </p>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Access Token</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12, color: config.accessTokenSet ? '#22c55e' : 'var(--text-muted)' }}>
                                    {config.accessTokenSet ? 'Token đã được cấu hình' : 'Chưa có Access Token'}
                                    {config.accessToken && <code style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{config.accessToken}</code>}
                                </div>
                                <input type="password" value={newToken} onChange={e => setNewToken(e.target.value)} placeholder="Nhập Access Token mới (bỏ trống nếu giữ nguyên)" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                    Tạo token tại <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-400)' }}>Events Manager → Settings → Generate access token</a>
                                </p>
                            </div>

                            <button onClick={savePixel} disabled={saving} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'var(--gradient-gold)', color: '#0a0a0f', fontWeight: 700, fontSize: 12, opacity: saving ? 0.6 : 1, marginRight: 8 }}>
                                {saving ? '⏳ Lưu...' : 'Lưu Token'}
                            </button>
                        </div>

                        {/* Test CAPI */}
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Kiểm tra kết nối CAPI</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                                Gửi test event PageView đến Facebook để kiểm tra kết nối.
                            </p>
                            <button onClick={testCAPI} disabled={testing || !config.pixelId} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 12, opacity: (testing || !config.pixelId) ? 0.5 : 1 }}>
                                {testing ? '⏳ Đang test...' : 'Gửi Test Event'}
                            </button>
                            {testResult && (
                                <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: testResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, fontSize: 12 }}>
                                    <span style={{ marginRight: 6 }}>{testResult.success ? '' : ''}</span>{testResult.message}
                                </div>
                            )}
                        </div>

                        {/* How it works */}
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Events đang gửi qua CAPI</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                                {['Purchase → khi đơn hàng hoàn tất', 'AddToCart → khi thêm giỏ hàng', 'ViewContent → khi xem sản phẩm', 'InitiateCheckout → khi bắt đầu thanh toán', 'Search → khi tìm kiếm', 'Contact → khi liên hệ'].map(e => (
                                    <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                                        <span style={{ color: '#22c55e' }}>✓</span> {e}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Google Analytics Tab ═══ */}
                {tab === 'ga' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Google Analytics 4</h3>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Measurement ID</div>
                                <input type="text" value={gaConfig.gaId} onChange={e => setGaConfig(p => ({ ...p, gaId: e.target.value }))} placeholder="G-XXXXXXXXXX" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                    Lấy ID tại <a href="https://analytics.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold-400)' }}>Google Analytics → Admin → Data Streams</a>
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Kích hoạt GA4</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Bật/tắt Google Analytics tracking</div></div>
                                <button onClick={() => setGaConfig(p => ({ ...p, enabled: !p.enabled }))} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', background: gaConfig.enabled ? '#22c55e' : 'var(--bg-tertiary)', position: 'relative', transition: 'all 200ms', flexShrink: 0 }}>
                                    <span style={{ position: 'absolute', top: 2, left: gaConfig.enabled ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'all 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                </button>
                            </div>

                            <button onClick={saveGA} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-gold)', color: '#0a0a0f', fontWeight: 700, fontSize: 13, opacity: saving ? 0.6 : 1 }}>
                                {saving ? '⏳ Đang lưu...' : 'Lưu cấu hình GA4'}
                            </button>
                        </div>

                        <div style={{ padding: '12px 16px', borderRadius: 10, background: gaConfig.enabled && gaConfig.gaId ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${gaConfig.enabled && gaConfig.gaId ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                            <span style={{ fontSize: 16 }}>{gaConfig.enabled && gaConfig.gaId ? '' : ''}</span>
                            <span>{gaConfig.enabled && gaConfig.gaId ? `Google Analytics đang hoạt động (${gaConfig.gaId})` : 'Google Analytics chưa được kích hoạt'}</span>
                        </div>

                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Events tự động tracking</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8, fontSize: 12 }}>
                                {['view_item', 'add_to_cart', 'add_to_wishlist', 'begin_checkout', 'add_payment_info', 'purchase', 'search', 'contact', 'quiz_start', 'quiz_complete', 'try_on_start', 'share_product', 'apply_voucher', 'flash_sale_click'].map(e => (
                                    <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                                        <span style={{ color: '#22c55e' }}>✓</span> <code style={{ fontSize: 11 }}>{e}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Events Config Tab ═══ */}
                {tab === 'events' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div className="analytics-card">
                            <h3 className="analytics-card__title">Sự kiện Meta Pixel</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Chọn sự kiện gửi đến Meta Pixel khi người dùng thao tác trên website</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                                {Object.entries(EVENT_LABELS).map(([key, info]) => {
                                    const active = config.events[key] !== false;
                                    return (
                                        <div key={key} onClick={() => setConfig(p => ({ ...p, events: { ...p.events, [key]: !active } }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 150ms', background: active ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)', border: `1px solid ${active ? 'rgba(34,197,94,0.25)' : 'var(--border-primary)'}` }}>
                                            <span style={{ fontSize: 20, flexShrink: 0 }}>{info.icon}</span>
                                            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{info.label}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{info.desc}</div></div>
                                            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#22c55e' : 'transparent', border: active ? 'none' : '2px solid var(--border-primary)', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                                                {active && '✓'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <button onClick={savePixel} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--gradient-gold)', color: '#0a0a0f', fontWeight: 700, fontSize: 13, opacity: saving ? 0.6 : 1, alignSelf: 'flex-start' }}>
                            {saving ? '⏳ Đang lưu...' : 'Lưu cấu hình Events'}
                        </button>

                        {config.updatedAt && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Cập nhật lần cuối: {new Date(config.updatedAt).toLocaleString('vi-VN')}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
