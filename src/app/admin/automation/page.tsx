'use client';

import { useState, useEffect } from 'react';

interface Workflow {
    name: string;
    desc: string;
    enabled: boolean;
    trigger: string;
    lastRun: string;
    recovered: number;
    recoveredRevenue: number;
    icon: string;
}

const INITIAL_WORKFLOWS: Workflow[] = [
    { name: 'Giỏ hàng bỏ quên', desc: 'Gửi nhắc nhở 3 cấp: nhẹ (1h), khẩn (12h), coupon (24h)', enabled: true, trigger: 'Mỗi giờ', lastRun: '21/02 14:00', recovered: 12, recoveredRevenue: 18500000, icon: '🛒' },
    { name: 'Hoa hồng tự động', desc: 'Giải phóng commission sau 14 ngày (chỉ đơn DELIVERED)', enabled: true, trigger: 'Mỗi ngày 02:00', lastRun: '21/02 02:00', recovered: 5, recoveredRevenue: 0, icon: '💰' },
    { name: 'Nâng cấp đối tác', desc: 'Tự động upgrade tier: Affiliate→Agent→Leader', enabled: true, trigger: 'Mỗi ngày 03:00', lastRun: '21/02 03:00', recovered: 1, recoveredRevenue: 0, icon: '⬆️' },
    { name: 'Fraud detection', desc: 'Tính risk score + flag đơn cần review trước khi giải phóng HH', enabled: true, trigger: 'Mỗi ngày 04:00', lastRun: '21/02 04:00', recovered: 0, recoveredRevenue: 0, icon: '🛡️' },
    { name: 'Browse Abandonment', desc: 'Xem sản phẩm 3+ lần mà chưa thêm giỏ → gửi nhắc mua', enabled: true, trigger: 'Mỗi 4 giờ', lastRun: '21/02 12:00', recovered: 8, recoveredRevenue: 7200000, icon: '👁️' },
    { name: 'Back-in-stock', desc: 'Thông báo khi sản phẩm Wishlist hết hàng có lại', enabled: true, trigger: 'Khi tồn kho > 0', lastRun: '21/02 09:00', recovered: 3, recoveredRevenue: 4500000, icon: '📦' },
    { name: 'Price Drop Alert', desc: 'Thông báo khi sản phẩm trong Wishlist giảm giá', enabled: true, trigger: 'Khi giá thay đổi', lastRun: '21/02 10:00', recovered: 5, recoveredRevenue: 6800000, icon: '🏷️' },
    { name: 'Commission → Delivered', desc: 'Commission chỉ AVAILABLE sau delivered + hold. REVERSED nếu RETURNED/FAILED', enabled: true, trigger: 'Khi đơn đổi trạng thái', lastRun: '21/02 08:00', recovered: 2, recoveredRevenue: 0, icon: '✅' },
];

const fmtMoney = (n: number) => n > 0 ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button onClick={onToggle} style={{
            width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', padding: 2,
            background: enabled ? 'linear-gradient(135deg, var(--gold-400), var(--gold-600))' : 'var(--bg-tertiary)',
            transition: 'background 250ms ease', flexShrink: 0,
        }}>
            <span style={{
                display: 'block', width: 22, height: 22, borderRadius: '50%',
                background: enabled ? '#fff' : 'var(--text-muted)',
                transform: enabled ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 250ms ease, background 250ms ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </button>
    );
}

export default function AdminAutomationPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const toggle = (index: number) => {
        setWorkflows((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], enabled: !updated[index].enabled };
            const w = updated[index];
            showToast(`${w.icon} ${w.name} — ${w.enabled ? 'Đã bật' : 'Đã tắt'}`);
            return updated;
        });
    };

    const activeCount = workflows.filter((w) => w.enabled).length;
    const totalRecovered = workflows.reduce((s, w) => s + (w.enabled ? w.recoveredRevenue : 0), 0);

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>⚡ Tự động hoá</h1>
                <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)',
                }}>
                    {activeCount}/{workflows.length} workflow đang chạy
                </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                Quản lý quy trình tự động — bật/tắt từng workflow theo nhu cầu
            </p>

            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 999,
                    padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontSize: 'var(--text-sm)', fontWeight: 600, animation: 'fadeIn 200ms ease',
                }}>{toast}</div>
            )}

            {/* Recovered Revenue Banner */}
            <div className="card" style={{
                padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
                background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(212,168,83,0.08))',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        💰 Recovered Revenue (tháng này)
                    </div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#22c55e', marginTop: 4 }}>
                        {fmtMoney(totalRecovered)}
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Doanh thu kéo lại từ giỏ bỏ quên,<br />browse abandonment, back-in-stock, price drop
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
                {workflows.map((w, i) => (
                    <div key={w.name} className="card" style={{
                        padding: 'var(--space-5)',
                        opacity: w.enabled ? 1 : 0.55,
                        transition: 'opacity 300ms ease',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                                    background: w.enabled ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, flexShrink: 0, transition: 'background 300ms ease',
                                }}>
                                    {w.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{w.name}</h3>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>{w.desc}</p>
                                </div>
                            </div>
                            <ToggleSwitch enabled={w.enabled} onToggle={() => toggle(i)} />
                        </div>

                        <div className="divider" style={{ margin: 'var(--space-3) 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                            <span>⏰ {w.trigger}</span>
                            <span>{w.enabled ? `Lần chạy cuối: ${w.lastRun}` : '⏸️ Đã tắt'}</span>
                        </div>

                        {w.enabled && (w.recovered > 0 || w.recoveredRevenue > 0) && (
                            <div style={{ marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                                {w.recovered > 0 && <span style={{ color: 'var(--success)' }}>✅ {w.recovered} lần xử lý hôm nay</span>}
                                {w.recoveredRevenue > 0 && <span style={{ color: '#22c55e', fontWeight: 600 }}>💰 {fmtMoney(w.recoveredRevenue)}</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* API Endpoints */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>🔗 API Endpoints</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Các endpoint có thể gọi từ cron job hoặc webhook:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {[
                        { method: 'POST', path: '/api/growth/abandoned-cart', desc: 'Scan giỏ bỏ quên' },
                        { method: 'POST', path: '/api/growth/browse-abandon', desc: 'Nhắc xem nhiều chưa mua' },
                        { method: 'POST', path: '/api/growth/notifications', desc: 'Back-in-stock + Price-drop' },
                        { method: 'POST', path: '/api/admin/commissions/release', desc: 'Giải phóng hoa hồng (delivered only)' },
                        { method: 'POST', path: '/api/admin/fraud/signals', desc: 'Tính risk score + flag đơn' },
                    ].map((api) => (
                        <div key={api.path} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                            <span className="badge" style={{ background: 'rgba(96,165,250,0.2)', fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-xs)' }}>
                                {api.method}
                            </span>
                            <code style={{ color: 'var(--gold-400)', fontSize: 'var(--text-xs)' }}>{api.path}</code>
                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>— {api.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
