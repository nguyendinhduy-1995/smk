'use client';

import { useState, useEffect } from 'react';

interface Workflow {
    id: string;
    name: string;
    desc: string;
    enabled: boolean;
    trigger: string;
    icon: string;
}

const WORKFLOW_DEFS: Workflow[] = [
    { id: 'abandoned-cart', name: 'Giỏ hàng bỏ quên', desc: 'Gửi nhắc nhở khi khách bỏ giỏ hàng sau 1h, 12h, 24h', enabled: false, trigger: 'Mỗi giờ', icon: '🛒' },
    { id: 'commission-release', name: 'Hoa hồng tự động', desc: 'Giải phóng commission sau 14 ngày (chỉ đơn DELIVERED)', enabled: false, trigger: 'Mỗi ngày 02:00', icon: '💰' },
    { id: 'partner-upgrade', name: 'Nâng cấp đối tác', desc: 'Tự động upgrade tier: Affiliate→Agent→Leader', enabled: false, trigger: 'Mỗi ngày 03:00', icon: '⬆' },
    { id: 'fraud-detect', name: 'Phát hiện gian lận', desc: 'Tính risk score + đánh dấu đơn cần xem xét', enabled: false, trigger: 'Mỗi ngày 04:00', icon: '🛡' },
    { id: 'browse-abandon', name: 'Nhắc xem chưa mua', desc: 'Xem sản phẩm 3+ lần chưa thêm giỏ → gửi nhắc', enabled: false, trigger: 'Mỗi 4 giờ', icon: '👀' },
    { id: 'back-in-stock', name: 'Thông báo có hàng', desc: 'Thông báo khi sản phẩm trong Wishlist có lại', enabled: false, trigger: 'Khi tồn kho > 0', icon: '📦' },
    { id: 'price-drop', name: 'Thông báo giảm giá', desc: 'Thông báo khi sản phẩm Wishlist giảm giá', enabled: false, trigger: 'Khi giá thay đổi', icon: '🏷' },
    { id: 'commission-status', name: 'Hoa hồng → Đã giao', desc: 'Hoa hồng chỉ khả dụng sau giao + chờ. Hoàn nếu trả/huỷ', enabled: false, trigger: 'Khi đơn đổi trạng thái', icon: '📋' },
];

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
    const [workflows, setWorkflows] = useState<Workflow[]>(WORKFLOW_DEFS);
    const [toast, setToast] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    // Load saved workflow config
    useEffect(() => {
        fetch('/api/admin/automation', { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.workflows) {
                    setWorkflows(prev => prev.map(w => {
                        const saved = data.workflows[w.id];
                        return saved ? { ...w, enabled: saved.enabled } : w;
                    }));
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const toggle = async (index: number) => {
        const updated = [...workflows];
        updated[index] = { ...updated[index], enabled: !updated[index].enabled };
        setWorkflows(updated);
        const w = updated[index];
        showToast(`${w.icon} ${w.name} — ${w.enabled ? 'Đã bật' : 'Đã tắt'}`);
        // Persist to server
        const config: Record<string, { enabled: boolean }> = {};
        updated.forEach(wf => { config[wf.id] = { enabled: wf.enabled }; });
        try {
            await fetch('/api/admin/automation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ workflows: config }),
            });
        } catch { showToast('Lỗi lưu cấu hình'); }
    };

    const activeCount = workflows.filter(w => w.enabled).length;

    if (loading) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="analytics-loading__spinner" />
            <p>Đang tải...</p>
        </div>
    );

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Tự động hoá</h1>
                <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: activeCount > 0 ? 'rgba(212,168,83,0.1)' : 'rgba(156,163,175,0.1)',
                    color: activeCount > 0 ? 'var(--gold-400)' : 'var(--text-muted)',
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

            {/* Info Banner */}
            <div className="card" style={{
                padding: 'var(--space-4)', marginBottom: 'var(--space-4)',
                background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(212,168,83,0.08))',
                display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
            }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Workflows chạy nội bộ</strong> — Bật workflow rồi cấu hình cron job để kích hoạt theo lịch.
                    Dữ liệu xử lý thực tế sẽ hiển thị khi workflow được chạy lần đầu.
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
                {workflows.map((w, i) => (
                    <div key={w.id} className="card" style={{
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
                            <span>{w.enabled ? '✅ Sẵn sàng' : 'Đã tắt'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* API Endpoints */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Điểm kết nối API</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    Các endpoint có thể gọi từ cron job hoặc webhook:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {[
                        { method: 'POST', path: '/api/growth/abandoned-cart', desc: 'Scan giỏ bỏ quên' },
                        { method: 'POST', path: '/api/growth/browse-abandon', desc: 'Nhắc xem nhiều chưa mua' },
                        { method: 'POST', path: '/api/growth/notifications', desc: 'Thông báo có hàng + giảm giá' },
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
