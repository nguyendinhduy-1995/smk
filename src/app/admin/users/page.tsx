'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    permissions: string[] | null;
    createdAt: string;
}

const ROLE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    ADMIN: { label: 'Admin', icon: '👑', color: '#ef4444' },
    STORE_MANAGER: { label: 'Quản lý cửa hàng', icon: '🏪', color: '#3b82f6' },
    STAFF: { label: 'Nhân viên', icon: '👤', color: '#22c55e' },
};

const PERMISSIONS = [
    { key: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { key: 'products', label: 'Sản phẩm', icon: '📦' },
    { key: 'orders', label: 'Đơn hàng', icon: '🧾' },
    { key: 'customers', label: 'Khách hàng', icon: '👥' },
    { key: 'partners', label: 'Đại lý/Aff', icon: '🤝' },
    { key: 'commissions', label: 'Hoa hồng', icon: '💰' },
    { key: 'payouts', label: 'Chi trả', icon: '🏦' },
    { key: 'automation', label: 'Tự động hoá', icon: '⚡' },
    { key: 'ai', label: 'AI & KB', icon: '🤖' },
    { key: 'analytics', label: 'Phân tích', icon: '📊' },
    { key: 'fraud', label: 'Chống gian lận', icon: '🛡️' },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [myRole, setMyRole] = useState('ADMIN');

    // Form state
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState('STAFF');
    const [formPerms, setFormPerms] = useState<string[]>(['dashboard']);

    // Read current user role from cookie
    useEffect(() => {
        try {
            const cookies = document.cookie.split(';').reduce((acc, c) => {
                const [k, v] = c.trim().split('=');
                acc[k] = v;
                return acc;
            }, {} as Record<string, string>);
            const token = cookies['smk_admin_session'];
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                setMyRole(payload.role || 'ADMIN');
            }
        } catch { /* ignore */ }
    }, []);

    const fetchUsers = useCallback(() => {
        setLoading(true);
        fetch('/api/admin/users')
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((data) => setUsers(data.users || []))
            .catch(() => setUsers([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const resetForm = () => {
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('STAFF');
        setFormPerms(['dashboard']);
        setEditUser(null);
    };

    const openCreate = () => {
        resetForm();
        setShowForm(true);
    };

    const openEdit = (user: User) => {
        setEditUser(user);
        setFormName(user.name || '');
        setFormEmail(user.email || '');
        setFormPassword('');
        setFormRole(user.role);
        setFormPerms(user.permissions || ['dashboard']);
        setShowForm(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            if (editUser) {
                // Update
                const body: Record<string, unknown> = { name: formName, email: formEmail, role: formRole };
                if (formPassword) body.password = formPassword;
                if (formRole === 'STAFF') body.permissions = formPerms;
                else body.permissions = null;

                const res = await fetch(`/api/admin/users/${editUser.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
                setMsg({ type: 'success', text: `Đã cập nhật ${formName}` });
            } else {
                // Create
                if (!formPassword) {
                    setMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu' });
                    setSaving(false);
                    return;
                }
                const res = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formName,
                        email: formEmail,
                        password: formPassword,
                        role: formRole,
                        permissions: formRole === 'STAFF' ? formPerms : null,
                    }),
                });
                if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
                setMsg({ type: 'success', text: `Đã tạo ${formName}` });
            }
            setShowForm(false);
            resetForm();
            fetchUsers();
        } catch (err: unknown) {
            setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`Xoá user "${user.name}"? Hành động này không thể hoàn tác.`)) return;
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setMsg({ type: 'success', text: `Đã xoá ${user.name}` });
            fetchUsers();
        } catch (err: unknown) {
            setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Có lỗi xảy ra' });
        }
    };

    const togglePerm = (perm: string) => {
        setFormPerms((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
        );
    };

    const isAdmin = myRole === 'ADMIN';

    return (
        <div className="animate-in">
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                <Link href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Admin</Link>
                {' › '}
                <span style={{ color: 'var(--text-primary)' }}>Users</span>
            </nav>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div style={{ flex: '1 1 200px' }}>
                    <h1 className="admin-page-title">👤 Quản lý người dùng</h1>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>
                        Quản lý tài khoản admin, quản lý và nhân viên
                    </p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={openCreate} style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}>
                        + Thêm nhân viên
                    </button>
                )}
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

            {/* Role Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {Object.entries(ROLE_LABELS).map(([role, info]) => {
                    const count = users.filter(u => u.role === role).length;
                    return (
                        <div key={role} className="stat-card">
                            <div className="stat-card__label">{info.icon} {info.label}</div>
                            <div className="stat-card__value" style={{ fontSize: 'var(--text-3xl)', color: info.color }}>
                                {count}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Form Dialog */}
            {showForm && (
                <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', border: '1px solid var(--gold-500)' }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)', fontSize: 'var(--text-lg)' }}>
                        {editUser ? `✏️ Sửa: ${editUser.name}` : '➕ Thêm nhân viên mới'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Họ tên *</label>
                            <input className="input" placeholder="Nguyễn Văn A" value={formName} onChange={(e) => setFormName(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Email *</label>
                            <input className="input" type="email" placeholder="email@example.com" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                                Mật khẩu {editUser ? '(để trống = giữ nguyên)' : '*'}
                            </label>
                            <input className="input" type="password" placeholder="••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Vai trò *</label>
                            <select className="input" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                                <option value="STAFF">👤 Nhân viên</option>
                                <option value="STORE_MANAGER">🏪 Quản lý cửa hàng</option>
                                <option value="ADMIN">👑 Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Permission checkboxes — only for STAFF */}
                    {formRole === 'STAFF' && (
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                                🔐 Quyền truy cập tính năng
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-2)' }}>
                                {PERMISSIONS.map((p) => (
                                    <label key={p.key} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: 'var(--space-2) var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        border: `1px solid ${formPerms.includes(p.key) ? 'var(--gold-400)' : 'var(--border-primary)'}`,
                                        background: formPerms.includes(p.key) ? 'rgba(212,168,83,0.08)' : 'transparent',
                                        cursor: 'pointer', transition: 'all 150ms',
                                        fontSize: 'var(--text-sm)',
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={formPerms.includes(p.key)}
                                            onChange={() => togglePerm(p.key)}
                                            style={{ accentColor: 'var(--gold-400)', width: 16, height: 16 }}
                                        />
                                        <span>{p.icon} {p.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                                <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }}
                                    onClick={() => setFormPerms(PERMISSIONS.map(p => p.key))}>Chọn tất cả</button>
                                <button className="btn btn-ghost" style={{ fontSize: 'var(--text-xs)' }}
                                    onClick={() => setFormPerms(['dashboard'])}>Bỏ chọn tất cả</button>
                            </div>
                        </div>
                    )}

                    {formRole !== 'STAFF' && (
                        <div style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(59,130,246,0.06)',
                            border: '1px solid rgba(59,130,246,0.15)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-tertiary)',
                            marginBottom: 'var(--space-4)',
                        }}>
                            ℹ️ {formRole === 'ADMIN' ? 'Admin có toàn quyền truy cập tất cả tính năng.' : 'Quản lý cửa hàng có quyền truy cập tất cả tính năng trừ quản lý users.'}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !formName || !formEmail}>
                            {saving ? '⏳ Đang lưu...' : editUser ? '✓ Cập nhật' : '✓ Tạo user'}
                        </button>
                        <button className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                            Huỷ
                        </button>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="card" style={{ overflow: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nhân viên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Quyền truy cập</th>
                            <th>Ngày tạo</th>
                            {isAdmin && <th>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Đang tải...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                                Chưa có người dùng nào. Hãy thêm nhân viên mới.
                            </td></tr>
                        ) : (
                            users.map((u) => {
                                const role = ROLE_LABELS[u.role] || ROLE_LABELS.STAFF;
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${role.color}, ${role.color}88)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 14, fontWeight: 700, color: '#fff',
                                                    flexShrink: 0,
                                                }}>
                                                    {(u.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{u.name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{u.email}</td>
                                        <td>
                                            <span style={{
                                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                                                background: role.color, color: '#fff',
                                            }}>
                                                {role.icon} {role.label}
                                            </span>
                                        </td>
                                        <td>
                                            {u.role === 'ADMIN' ? (
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>Toàn quyền</span>
                                            ) : u.role === 'STORE_MANAGER' ? (
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tất cả (trừ users)</span>
                                            ) : (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                                    {(u.permissions || []).length > 0 ? (u.permissions || []).map((p) => (
                                                        <span key={p} style={{
                                                            fontSize: 9, padding: '1px 5px', borderRadius: 3,
                                                            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                                                        }}>{p}</span>
                                                    )) : (
                                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Chưa cấp quyền</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        {isAdmin && (
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(u)} title="Sửa">
                                                        ✏️
                                                    </button>
                                                    <button className="btn btn-sm btn-ghost" style={{ color: 'var(--error)' }}
                                                        onClick={() => handleDelete(u)} title="Xoá">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
