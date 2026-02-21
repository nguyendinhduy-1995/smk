'use client';

import { useState, useEffect } from 'react';

interface CommissionRule {
    id: string;
    scope: string;
    scopeId: string | null;
    partnerLevel: string | null;
    percent: number;
    fixed: number | null;
    isActive: boolean;
    createdAt: string;
}

interface TierDefault { level: string; percent: number; label: string }

const SCOPES: Record<string, string> = { GLOBAL: 'Toàn cục', CATEGORY: 'Danh mục', PRODUCT: 'Sản phẩm' };
const LEVELS: Record<string, string> = { AFFILIATE: '⭐ Cộng tác viên', AGENT: '🏆 Đại lý', LEADER: '👑 Trưởng nhóm' };

export default function AdminCommissionTiersPage() {
    const [rules, setRules] = useState<CommissionRule[]>([]);
    const [defaults, setDefaults] = useState<TierDefault[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [formScope, setFormScope] = useState('GLOBAL');
    const [formScopeId, setFormScopeId] = useState('');
    const [formLevel, setFormLevel] = useState('');
    const [formPercent, setFormPercent] = useState('10');
    const [formFixed, setFormFixed] = useState('');

    const FALLBACK_DEFAULTS: TierDefault[] = [
        { level: 'AFFILIATE', percent: 5, label: 'Cộng tác viên' },
        { level: 'AGENT', percent: 8, label: 'Đại lý' },
        { level: 'LEADER', percent: 12, label: 'Trưởng nhóm' },
    ];

    const fetchData = () => {
        setLoading(true);
        fetch('/api/admin/commissions/tiers')
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((data) => {
                setRules(data.rules || []);
                setDefaults(data.defaultTiers?.length ? data.defaultTiers : FALLBACK_DEFAULTS);
            })
            .catch(() => {
                setRules([]);
                setDefaults(FALLBACK_DEFAULTS);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch('/api/admin/commissions/tiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scope: formScope,
                    scopeId: formScopeId || null,
                    partnerLevel: formLevel || null,
                    percent: Number(formPercent),
                    fixed: formFixed ? Number(formFixed) : null,
                }),
            });
            if (!res.ok) throw new Error('Failed');
            setMsg({ type: 'success', text: 'Đã lưu rule thành công!' });
            setShowForm(false);
            fetchData();
        } catch {
            setMsg({ type: 'error', text: 'Có lỗi, vui lòng thử lại.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>⚙️ Commission Tiers</h1>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>Quản lý tỉ lệ hoa hồng theo cấp bậc và phạm vi</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Đóng' : '+ Thêm Rule'}
                </button>
            </div>

            {msg && (
                <div style={{
                    padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)',
                    background: msg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: msg.type === 'success' ? 'var(--success)' : 'var(--error)', fontSize: 'var(--text-sm)',
                }}>
                    {msg.type === 'success' ? '✅' : '❌'} {msg.text}
                </div>
            )}

            {/* Default Tiers */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📋 Tỉ lệ mặc định (khi không có rule riêng)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
                    {defaults.map((t) => (
                        <div key={t.level} className="stat-card" style={{ border: '1px solid var(--gold-500)', background: 'rgba(212,168,83,0.05)' }}>
                            <div className="stat-card__label">{LEVELS[t.level] || t.level}</div>
                            <div className="stat-card__value" style={{ fontSize: 'var(--text-3xl)', color: 'var(--gold-400)' }}>{t.percent}%</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Rule Form */}
            {showForm && (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-4)' }}>Thêm/Sửa Rule</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phạm vi</label>
                            <select className="input" value={formScope} onChange={(e) => setFormScope(e.target.value)}>
                                <option value="GLOBAL">Toàn cục</option>
                                <option value="CATEGORY">Danh mục</option>
                                <option value="PRODUCT">Sản phẩm</option>
                            </select>
                        </div>
                        {formScope !== 'GLOBAL' && (
                            <div>
                                <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                                    {formScope === 'CATEGORY' ? 'Category ID' : 'Product ID'}
                                </label>
                                <input className="input" placeholder="ID..." value={formScopeId} onChange={(e) => setFormScopeId(e.target.value)} />
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Cấp bậc (bỏ trống = tất cả)</label>
                            <select className="input" value={formLevel} onChange={(e) => setFormLevel(e.target.value)}>
                                <option value="">Tất cả cấp bậc</option>
                                <option value="AFFILIATE">Cộng tác viên</option>
                                <option value="AGENT">Đại lý</option>
                                <option value="LEADER">Trưởng nhóm</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Phần trăm (%)</label>
                            <input className="input" type="number" min="0" max="50" value={formPercent} onChange={(e) => setFormPercent(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Cố định (₫, tuỳ chọn)</label>
                            <input className="input" type="number" placeholder="VD: 50000" value={formFixed} onChange={(e) => setFormFixed(e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '⏳...' : '✓ Lưu Rule'}</button>
                        <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                    </div>
                </div>
            )}

            {/* Existing Rules Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Phạm vi</th>
                            <th>Scope ID</th>
                            <th>Cấp bậc</th>
                            <th>Tỉ lệ</th>
                            <th>Cố định</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Đang tải...</td></tr>
                        ) : rules.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                Chưa có rule tuỳ chỉnh. Đang dùng tỉ lệ mặc định.
                            </td></tr>
                        ) : (
                            rules.map((r) => (
                                <tr key={r.id}>
                                    <td><span className="badge badge-neutral">{SCOPES[r.scope] || r.scope}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono, monospace)' }}>{r.scopeId || '—'}</td>
                                    <td>{r.partnerLevel ? (LEVELS[r.partnerLevel] || r.partnerLevel) : 'Tất cả'}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{r.percent}%</td>
                                    <td>{r.fixed ? `${r.fixed.toLocaleString('vi-VN')}₫` : '—'}</td>
                                    <td><span className={`badge ${r.isActive ? 'badge-success' : 'badge-error'}`}>{r.isActive ? 'Active' : 'Off'}</span></td>
                                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
