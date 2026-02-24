'use client';

import { useEffect, useState } from 'react';

interface FeatureInfo {
    key: string;
    label: string;
    icon: string;
    desc: string;
    enabled: boolean;
}

export default function EntitlementsPage() {
    const [features, setFeatures] = useState<FeatureInfo[]>([]);
    const [limits, setLimits] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/features')
            .then(r => r.json())
            .then(d => {
                setFeatures(d.all || []);
                setLimits(d.limits || {});
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const enabledCount = features.filter(f => f.enabled).length;

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            ⏳ Đang tải...
        </div>
    );

    return (
        <div style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: 800 }}>🔑 Tính năng & Quyền sử dụng</h1>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Quản lý entitlement — {enabledCount}/{features.length} tính năng đang bật
                    </p>
                </div>
                <div style={{
                    padding: '8px 16px', borderRadius: '12px',
                    background: enabledCount === features.length
                        ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                    color: enabledCount === features.length ? '#22c55e' : '#eab308',
                    fontSize: '13px', fontWeight: 700,
                }}>
                    {enabledCount === features.length ? '✅ Full Package' : `${enabledCount} / ${features.length} ON`}
                </div>
            </div>

            {/* Feature Grid */}
            <div style={{ display: 'grid', gap: '12px' }}>
                {features.map(f => (
                    <div key={f.key} style={{
                        padding: '16px 20px', borderRadius: '12px',
                        background: 'var(--bg-card, #fff)',
                        border: `1px solid ${f.enabled ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
                        display: 'flex', alignItems: 'center', gap: '16px',
                        opacity: f.enabled ? 1 : 0.6,
                    }}>
                        <span style={{ fontSize: '24px' }}>{f.icon}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{f.label}</span>
                                <code style={{
                                    fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                                    background: 'rgba(0,0,0,0.06)', color: 'var(--text-muted)',
                                }}>{f.key}</code>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.desc}</p>
                        </div>
                        <div style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                            background: f.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: f.enabled ? '#22c55e' : '#ef4444',
                        }}>
                            {f.enabled ? '✅ ON' : '❌ OFF'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Limits */}
            {Object.keys(limits).length > 0 && (
                <div style={{ marginTop: '24px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>📊 Giới hạn sử dụng</h2>
                    <div style={{
                        padding: '16px', borderRadius: '12px',
                        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)',
                    }}>
                        {Object.entries(limits).map(([key, val]) => (
                            <div key={key} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '8px 0', borderBottom: '1px solid var(--border, #e5e7eb)',
                            }}>
                                <code style={{ fontSize: '12px' }}>{key}</code>
                                <span style={{ fontWeight: 700 }}>{val.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Config Source */}
            <div style={{
                marginTop: '24px', padding: '16px', borderRadius: '12px',
                background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)',
                fontSize: '12px', color: 'var(--text-muted)',
            }}>
                <strong>💡 Cấu hình:</strong> Feature flags được đọc từ biến môi trường <code>SMK_FEATURES</code>.
                <br />Giá trị: <code>ALL</code> (tất cả bật), <code>NONE</code> (tất cả tắt), hoặc danh sách key phân cách bằng dấu phẩy.
                <br />Ví dụ: <code>SMK_FEATURES=ADV_SHIPPING,ADV_WAREHOUSE,ADV_AI</code>
            </div>
        </div>
    );
}
