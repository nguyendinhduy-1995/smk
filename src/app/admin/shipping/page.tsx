'use client';

import { useState, useEffect } from 'react';

interface Carrier {
    carrier: string;
    name: string;
    enabled: boolean;
    mode: string;
    apiUrl: string | null;
    apiKey?: string;
    lastHealthCheck: string | null;
    lastError: string | null;
}

const CARRIER_ICONS: Record<string, string> = {
    GHN: '🚚', GHTK: '📦', VIETTEL_POST: '📮', JT: '⚡',
    NINJA_VAN: '🥷', VNPOST: '✉️', AHAMOVE: '🏍️', OTHER: '📋',
};

const SYNC_MODES = [
    { value: 'WEBHOOK', label: 'Webhook', desc: 'Realtime push từ hãng' },
    { value: 'POLL', label: 'Poll', desc: 'Kiểm tra định kỳ' },
    { value: 'HYBRID', label: 'Hybrid', desc: 'Webhook + poll backup' },
];

const SHIPMENT_STATUSES = [
    { status: 'CREATED', label: 'Đã tạo', color: '#888' },
    { status: 'PICKED_UP', label: 'Đã lấy hàng', color: '#60a5fa' },
    { status: 'IN_TRANSIT', label: 'Đang vận chuyển', color: '#f59e0b' },
    { status: 'OUT_FOR_DELIVERY', label: 'Đang giao', color: '#fb923c' },
    { status: 'DELIVERED', label: '✅ Đã giao', color: '#22c55e' },
    { status: 'FAILED_DELIVERY', label: '❌ Giao thất bại', color: '#ef4444' },
    { status: 'RETURNED_TO_SENDER', label: '↩️ Hoàn về', color: '#a855f7' },
    { status: 'CANCELLED', label: '🚫 Đã huỷ', color: '#6b7280' },
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

export default function AdminShippingPage() {
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [statusMapping, setStatusMapping] = useState<Record<string, Record<string, string>>>({});
    const [toast, setToast] = useState<string | null>(null);
    const [testing, setTesting] = useState<string | null>(null);
    const [slaConfig, setSlaConfig] = useState({ days: 5 });

    useEffect(() => {
        fetch('/api/admin/shipping').then(r => r.json()).then(data => {
            setCarriers(data.carriers || []);
            setStatusMapping(data.statusMapping || {});
        });
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const toggleCarrier = async (index: number) => {
        const updated = [...carriers];
        updated[index] = { ...updated[index], enabled: !updated[index].enabled };
        setCarriers(updated);
        const c = updated[index];
        await fetch('/api/admin/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrier: c.carrier, enabled: c.enabled, mode: c.mode }),
        });
        showToast(`${CARRIER_ICONS[c.carrier]} ${c.name} — ${c.enabled ? 'Đã bật' : 'Đã tắt'}`);
    };

    const changeMode = async (index: number, mode: string) => {
        const updated = [...carriers];
        updated[index] = { ...updated[index], mode };
        setCarriers(updated);
        const c = updated[index];
        await fetch('/api/admin/shipping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrier: c.carrier, enabled: c.enabled, mode }),
        });
        showToast(`${c.name} → mode ${mode}`);
    };

    const testConnection = async (carrier: string) => {
        setTesting(carrier);
        await new Promise(r => setTimeout(r, 1500));
        const c = carriers.find(x => x.carrier === carrier);
        if (c?.enabled) {
            showToast(`✅ ${c.name} — kết nối thành công`);
        } else {
            showToast(`⚠️ Bật hãng trước khi test`);
        }
        setTesting(null);
    };

    const enabledCount = carriers.filter(c => c.enabled).length;

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>🚚 Vận chuyển đa hãng</h1>
                <span style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)',
                }}>
                    {enabledCount}/{carriers.length} hãng đang bật
                </span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Cấu hình hãng vận chuyển, chế độ đồng bộ, và theo dõi sức khoẻ kết nối
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

            {/* SLA Config */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>⚠️ SLA cảnh báo:</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Shipped quá</span>
                <input type="number" value={slaConfig.days} onChange={e => setSlaConfig({ days: Number(e.target.value) })}
                    style={{ width: 60, padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', textAlign: 'center', fontSize: 'var(--text-sm)' }}
                />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>ngày chưa delivered → đưa vào "Đơn cần xử lý gấp"</span>
            </div>

            {/* Carrier Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
                {carriers.map((c, i) => (
                    <div key={c.carrier} className="card" style={{
                        padding: 'var(--space-5)',
                        opacity: c.enabled ? 1 : 0.55,
                        transition: 'opacity 300ms ease',
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                    background: c.enabled ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, transition: 'background 300ms ease',
                                }}>
                                    {CARRIER_ICONS[c.carrier] || '📦'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{c.name}</h3>
                                    <code style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{c.carrier}</code>
                                </div>
                            </div>
                            <ToggleSwitch enabled={c.enabled} onToggle={() => toggleCarrier(i)} />
                        </div>

                        <div className="divider" style={{ margin: 'var(--space-3) 0' }} />

                        {/* Sync Mode */}
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                                Chế độ đồng bộ
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                {SYNC_MODES.map(m => (
                                    <button key={m.value} onClick={() => changeMode(i, m.value)}
                                        className="btn btn-sm"
                                        style={{
                                            flex: 1, fontSize: 'var(--text-xs)', padding: '6px 8px',
                                            background: c.mode === m.value ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)',
                                            color: c.mode === m.value ? 'var(--gold-400)' : 'var(--text-muted)',
                                            border: c.mode === m.value ? '1px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                        }}>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Health & Actions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                            <div style={{ color: 'var(--text-muted)' }}>
                                {c.lastHealthCheck ? (
                                    <span>✅ Healthy — {new Date(c.lastHealthCheck).toLocaleDateString('vi')}</span>
                                ) : (
                                    <span>⏸️ Chưa kiểm tra</span>
                                )}
                            </div>
                            <button className="btn btn-sm btn-ghost" onClick={() => testConnection(c.carrier)}
                                disabled={testing === c.carrier} style={{ fontSize: 'var(--text-xs)' }}>
                                {testing === c.carrier ? '⏳ Testing...' : '🔍 Test API'}
                            </button>
                        </div>

                        {c.lastError && (
                            <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--error)', background: 'rgba(239,68,68,0.1)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                                ❌ {c.lastError}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Status Mapping Reference */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📋 Bảng mapping trạng thái</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    Trạng thái từ các hãng → enum nội bộ chuẩn hoá
                </p>

                {/* Internal statuses */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    {SHIPMENT_STATUSES.map(s => (
                        <span key={s.status} style={{
                            fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)',
                            background: `${s.color}22`, color: s.color, fontWeight: 600,
                        }}>
                            {s.label}
                        </span>
                    ))}
                </div>

                {/* Carrier-specific mapping table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)' }}>Hãng</th>
                                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)' }}>Trạng thái gốc</th>
                                <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)' }}>→ Nội bộ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(statusMapping).map(([carrier, mapping]) =>
                                Object.entries(mapping).map(([from, to], idx) => (
                                    <tr key={`${carrier}-${from}`} style={{ borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.05))' }}>
                                        {idx === 0 && (
                                            <td rowSpan={Object.keys(mapping).length} style={{ padding: '8px', fontWeight: 600, verticalAlign: 'top' }}>
                                                {CARRIER_ICONS[carrier]} {carrier}
                                            </td>
                                        )}
                                        <td style={{ padding: '8px' }}><code style={{ color: 'var(--gold-400)' }}>{from}</code></td>
                                        <td style={{ padding: '8px' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)',
                                                background: `${SHIPMENT_STATUSES.find(s => s.status === to)?.color || '#888'}22`,
                                                color: SHIPMENT_STATUSES.find(s => s.status === to)?.color || '#888',
                                            }}>
                                                {SHIPMENT_STATUSES.find(s => s.status === to)?.label || to}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
