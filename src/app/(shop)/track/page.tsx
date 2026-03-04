'use client';

import { useState } from 'react';

interface TrackingEvent {
    mappedStatus: string;
    note: string;
    location: string;
    occurredAt: string;
}

interface TrackingResult {
    found: boolean;
    trackingCode?: string;
    carrier?: string;
    carrierName?: string;
    status?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedAt?: string;
    orderCode?: string;
    destination?: string;
    events?: TrackingEvent[];
    message?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    CREATED: { label: 'Đã tạo đơn', color: '#888', icon: '📝' },
    PICKED_UP: { label: 'Đã lấy hàng', color: '#60a5fa', icon: '📦' },
    IN_TRANSIT: { label: 'Đang vận chuyển', color: '#f59e0b', icon: '🚚' },
    OUT_FOR_DELIVERY: { label: 'Đang giao hàng', color: '#fb923c', icon: '🏍️' },
    DELIVERED: { label: 'Đã giao thành công', color: '#22c55e', icon: '✅' },
    FAILED_DELIVERY: { label: 'Giao thất bại', color: '#ef4444', icon: '❌' },
    RETURNED_TO_SENDER: { label: 'Hoàn về shop', color: '#a855f7', icon: '' },
    CANCELLED: { label: 'Đã huỷ', color: '#6b7280', icon: '🚫' },
};

const CARRIER_NAMES: Record<string, string> = {
    GHN: 'Giao Hàng Nhanh', GHTK: 'Giao Hàng Tiết Kiệm', VIETTEL_POST: 'Viettel Post',
    JT: 'J&T Express', NINJA_VAN: 'Ninja Van', VNPOST: 'VNPost', AHAMOVE: 'Ahamove', OTHER: 'Khác',
};

export default function TrackingPage() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const search = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!code.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`/api/track?code=${encodeURIComponent(code.trim())}`);
            const data = await res.json();
            setResult(data);
        } catch {
            setResult({ found: false, message: 'Lỗi kết nối. Vui lòng thử lại.' });
        }
        setLoading(false);
    };

    const fmt = (d: string) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    📦 Tra cứu vận đơn
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                    Nhập mã vận đơn để theo dõi tình trạng giao hàng
                </p>
            </div>

            {/* Search form */}
            <form onSubmit={search} style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="VD: SMK240001, GHN123456..."
                    autoFocus
                    style={{
                        flex: 1, padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)',
                        background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                        fontSize: 16, minHeight: 48,
                    }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}
                    style={{ padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', fontWeight: 600, cursor: 'pointer', minHeight: 48, minWidth: 100 }}>
                    {loading ? '⏳' : '🔍 Tra cứu'}
                </button>
            </form>

            {/* Demo hint */}
            {!searched && (
                <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>
                    💡 Thử mã: <button onClick={() => { setCode('SMK240001'); }} style={{ color: 'var(--gold-400)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>SMK240001</button>
                    {' '}hoặc{' '}
                    <button onClick={() => { setCode('SMK240002'); }} style={{ color: 'var(--gold-400)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>SMK240002</button>
                </div>
            )}

            {/* Results */}
            {result && result.found && (
                <div className="card" style={{ padding: 'var(--space-5)', animation: 'fadeIn 300ms ease' }}>
                    {/* Shipment header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Mã vận đơn</div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--gold-400)' }}>{result.trackingCode}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                                Hãng: <strong>{result.carrierName || CARRIER_NAMES[result.carrier || ''] || result.carrier}</strong>
                            </div>
                        </div>
                        <div style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-lg)',
                            background: `${STATUS_MAP[result.status || '']?.color || '#888'}22`,
                            color: STATUS_MAP[result.status || '']?.color || '#888',
                            fontWeight: 700, fontSize: 'var(--text-sm)', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 24 }}>{STATUS_MAP[result.status || '']?.icon || '📦'}</div>
                            {STATUS_MAP[result.status || '']?.label || result.status}
                        </div>
                    </div>

                    {/* Key dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                        {result.shippedAt && (
                            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Ngày gửi</div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{fmt(result.shippedAt)}</div>
                            </div>
                        )}
                        {result.estimatedAt && !result.deliveredAt && (
                            <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dự kiến nhận</div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2, color: 'var(--gold-400)' }}>{fmt(result.estimatedAt)}</div>
                            </div>
                        )}
                        {result.deliveredAt && (
                            <div style={{ padding: 'var(--space-3)', background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Đã giao lúc</div>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2, color: '#22c55e' }}>{fmt(result.deliveredAt)}</div>
                            </div>
                        )}
                    </div>

                    <div className="divider" style={{ margin: 'var(--space-4) 0' }} />

                    {/* Timeline */}
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                        📍 Lịch trình vận chuyển
                    </h3>
                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                        {/* Timeline line */}
                        <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--border-primary)' }} />

                        {result.events?.map((event, i) => {
                            const st = STATUS_MAP[event.mappedStatus];
                            const isLatest = i === 0;
                            return (
                                <div key={i} style={{ position: 'relative', paddingBottom: i < (result.events?.length || 0) - 1 ? 20 : 0 }}>
                                    {/* Dot */}
                                    <div style={{
                                        position: 'absolute', left: -20, top: 4,
                                        width: isLatest ? 16 : 12, height: isLatest ? 16 : 12,
                                        borderRadius: '50%',
                                        background: st?.color || '#888',
                                        border: isLatest ? `3px solid ${st?.color || '#888'}44` : 'none',
                                        boxShadow: isLatest ? `0 0 8px ${st?.color || '#888'}44` : 'none',
                                    }} />
                                    <div style={{ marginLeft: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: isLatest ? 700 : 500, color: isLatest ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                                {event.note}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            {event.location && <span>{event.location} · </span>}
                                            {fmt(event.occurredAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Not found */}
            {result && !result.found && (
                <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', animation: 'fadeIn 300ms ease' }}>
                    <div style={{ fontSize: 48, marginBottom: 'var(--space-3)' }}>🔍</div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Không tìm thấy vận đơn</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                        {result.message || 'Vui lòng kiểm tra lại mã vận đơn'}
                    </p>
                    <a href="/support" className="btn btn-ghost" style={{ fontSize: 'var(--text-sm)' }}>
                        📞 Liên hệ shop
                    </a>
                </div>
            )}

            {/* Contact */}
            {result?.found && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                    <a href="/support" style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', textDecoration: 'none' }}>
                        📞 Cần hỗ trợ? Liên hệ shop
                    </a>
                </div>
            )}

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
