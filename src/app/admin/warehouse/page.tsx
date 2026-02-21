'use client';

import { useState, useEffect, useCallback } from 'react';

/* ═══ Types ═══ */
interface Warehouse { id: string; name: string; code: string; isActive: boolean }
interface Voucher {
    id: string; code: string; type: string; status: string;
    warehouseId: string; warehouse: Warehouse;
    note: string | null; reason: string | null; createdBy: string; approvedBy: string | null;
    postedAt: string | null; createdAt: string;
    items: VoucherItem[];
}
interface VoucherItem { id: string; variantId: string; qty: number; note: string | null }
interface LedgerEntry {
    id: string; variantId: string; warehouseId: string; type: string;
    qty: number; balance: number; refType: string | null; refId: string | null;
    note: string | null; createdBy: string | null; createdAt: string;
}
interface StockItem { id: string; sku: string; name: string; stockQty: number; reserved: number; available: number; lowThreshold: number }

const TYPE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    RECEIPT: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: '📥 Nhập' },
    ISSUE: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa', label: '📤 Xuất' },
    ADJUST: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', label: '🔧 Điều chỉnh' },
    RESERVE: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', label: '🔒 Reserve' },
    RELEASE: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6', label: '🔓 Release' },
    SHIP: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: '🚚 Giao' },
    RETURN_IN: { bg: 'rgba(234,88,12,0.15)', text: '#ea580c', label: '↩️ Hoàn' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    DRAFT: { bg: 'rgba(156,163,175,0.15)', text: '#9ca3af' },
    SUBMITTED: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    APPROVED: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
    POSTED: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    CANCELLED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
};

const fmtDate = (d: string) => new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export default function AdminWarehousePage() {
    const [tab, setTab] = useState<'stock' | 'vouchers' | 'ledger' | 'stocktake'>('stock');
    const [toast, setToast] = useState('');
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // New voucher form
    const [showNewVoucher, setShowNewVoucher] = useState(false);
    const [newType, setNewType] = useState<'RECEIPT' | 'ISSUE' | 'ADJUST'>('RECEIPT');
    const [newNote, setNewNote] = useState('');
    const [newItems, setNewItems] = useState<{ variantId: string; qty: number; note: string }[]>([
        { variantId: '', qty: 1, note: '' },
    ]);

    // Demo stock data (will be API-driven in production)
    const [stockItems] = useState<StockItem[]>([
        { id: '1', sku: 'RB-AVI-GOLD-55', name: 'Aviator Classic Gold', stockQty: 45, reserved: 3, available: 42, lowThreshold: 10 },
        { id: '2', sku: 'RB-WAY-BLK-52', name: 'Wayfarer Black', stockQty: 30, reserved: 5, available: 25, lowThreshold: 10 },
        { id: '3', sku: 'TF-BUT-DRK-54', name: 'Butterfly Dark Havana', stockQty: 8, reserved: 2, available: 6, lowThreshold: 10 },
        { id: '4', sku: 'OAK-HOL-MT-57', name: 'Holbrook Matte Black', stockQty: 22, reserved: 0, available: 22, lowThreshold: 10 },
        { id: '5', sku: 'GUC-CAT-PNK-53', name: 'Cat Eye Retro Pink', stockQty: 3, reserved: 1, available: 2, lowThreshold: 5 },
        { id: '6', sku: 'LIN-RIM-GOL-50', name: 'Rimless Gold', stockQty: 12, reserved: 0, available: 12, lowThreshold: 5 },
    ]);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    /* ═══ Fetch vouchers ═══ */
    const fetchVouchers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inventory/vouchers');
            const data = await res.json();
            setVouchers(data.vouchers || []);
        } catch { /* use empty */ }
        setLoading(false);
    }, []);

    useEffect(() => { if (tab === 'vouchers') fetchVouchers(); }, [tab, fetchVouchers]);

    /* ═══ Create voucher ═══ */
    const createVoucher = async () => {
        if (newItems.some(it => !it.variantId || it.qty < 1)) {
            showToast('⚠️ Kiểm tra lại mã biến thể và số lượng');
            return;
        }
        try {
            const res = await fetch('/api/admin/inventory/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: newType,
                    warehouseId: 'default',
                    note: newNote,
                    items: newItems,
                    createdBy: 'admin',
                }),
            });
            const data = await res.json();
            if (data.voucher) {
                showToast(`✅ Đã tạo phiếu ${data.voucher.code}`);
                setShowNewVoucher(false);
                setNewItems([{ variantId: '', qty: 1, note: '' }]);
                setNewNote('');
                fetchVouchers();
            }
        } catch { showToast('⚠️ Tạo phiếu thất bại'); }
    };

    /* ═══ Advance voucher status ═══ */
    const advanceVoucher = async (id: string, action: string) => {
        try {
            const res = await fetch('/api/admin/inventory/vouchers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, approvedBy: 'admin' }),
            });
            const data = await res.json();
            if (data.error) { showToast(`⚠️ ${data.error}`); return; }
            showToast(`✅ Đã ${action} phiếu`);
            fetchVouchers();
        } catch { showToast('⚠️ Thao tác thất bại'); }
    };

    /* ═══ CSV Export ═══ */
    const exportCSV = () => {
        const header = 'SKU,Tên,Tồn kho,Đặt trước,Khả dụng,Ngưỡng thấp\n';
        const rows = stockItems.map(s => `${s.sku},${s.name},${s.stockQty},${s.reserved},${s.available},${s.lowThreshold}`).join('\n');
        const blob = new Blob([header + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `ton-kho-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
        showToast('📥 Đã xuất CSV');
    };

    /* ═══ RENDER ═══ */
    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>📦 Quản lý kho</h1>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <button className="btn" onClick={exportCSV} style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}>📥 Xuất CSV</button>
                    <button className="btn btn-primary" onClick={() => setShowNewVoucher(true)} style={{ fontSize: 'var(--text-xs)', padding: '6px 12px' }}>+ Tạo phiếu</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-primary)', paddingBottom: 'var(--space-2)', overflowX: 'auto' }}>
                {[
                    { key: 'stock' as const, label: '📊 Tồn kho', count: stockItems.length },
                    { key: 'vouchers' as const, label: '📋 Phiếu NXĐ', count: vouchers.length },
                    { key: 'ledger' as const, label: '📖 Sổ cái', count: ledger.length },
                    { key: 'stocktake' as const, label: '📝 Kiểm kê' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className="btn"
                        style={{ padding: 'var(--space-2) var(--space-4)', background: tab === t.key ? 'var(--gold-500)' : 'transparent', color: tab === t.key ? '#000' : 'var(--text-primary)', fontWeight: tab === t.key ? 700 : 500, borderRadius: 'var(--radius-md)' }}>
                        {t.label} {t.count !== undefined ? `(${t.count})` : ''}
                    </button>
                ))}
            </div>

            {/* ═══ TAB: Stock Overview ═══ */}
            {tab === 'stock' && (
                <>
                    {/* Low stock alerts */}
                    {stockItems.filter(s => s.available <= s.lowThreshold).length > 0 && (
                        <div className="card" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                            <strong style={{ color: '#f59e0b' }}>⚠️ Cảnh báo tồn kho thấp:</strong>
                            <ul style={{ margin: 'var(--space-2) 0 0 var(--space-4)', fontSize: 'var(--text-sm)' }}>
                                {stockItems.filter(s => s.available <= s.lowThreshold).map(s => (
                                    <li key={s.id} style={{ color: s.available <= 3 ? '#ef4444' : '#f59e0b' }}>
                                        {s.name} ({s.sku}) — còn {s.available} / ngưỡng {s.lowThreshold}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="card" style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>SKU</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Sản phẩm</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Tồn kho</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Đặt trước</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Khả dụng</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockItems.map(s => (
                                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>{s.sku}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>{s.name}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', textAlign: 'right' }}>{s.stockQty}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', textAlign: 'right', color: s.reserved > 0 ? '#8b5cf6' : 'var(--text-muted)' }}>{s.reserved}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', textAlign: 'right', fontWeight: 700 }}>{s.available}</td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 10px', borderRadius: 99, fontSize: 'var(--text-xs)', fontWeight: 600,
                                                background: s.available <= 3 ? 'rgba(239,68,68,0.15)' : s.available <= s.lowThreshold ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                                                color: s.available <= 3 ? '#ef4444' : s.available <= s.lowThreshold ? '#f59e0b' : '#22c55e',
                                            }}>
                                                {s.available <= 3 ? '🔴 Cực thấp' : s.available <= s.lowThreshold ? '🟡 Thấp' : '🟢 Đủ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ═══ TAB: Vouchers ═══ */}
            {tab === 'vouchers' && (
                <div className="card" style={{ overflowX: 'auto' }}>
                    {loading ? <p style={{ textAlign: 'center', padding: 'var(--space-6)' }}>⏳ Đang tải...</p> : vouchers.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                            Chưa có phiếu nào. Nhấn "➕ Tạo phiếu" để bắt đầu.
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Mã phiếu</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Loại</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Trạng thái</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Dòng</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Ngày</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vouchers.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 600 }}>{v.code}</td>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <span style={{ ...TYPE_COLORS[v.type] ? { background: TYPE_COLORS[v.type].bg, color: TYPE_COLORS[v.type].text } : {}, padding: '2px 10px', borderRadius: 99, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                                                {TYPE_COLORS[v.type]?.label || v.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <span style={{ ...STATUS_COLORS[v.status] ? { background: STATUS_COLORS[v.status].bg, color: STATUS_COLORS[v.status].text } : {}, padding: '2px 10px', borderRadius: 99, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                                                {v.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'right', fontSize: 'var(--text-sm)' }}>{v.items.length}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fmtDate(v.createdAt)}</td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'center' }}>
                                                {v.status === 'DRAFT' && <button className="btn" onClick={() => advanceVoucher(v.id, 'submit')} style={{ fontSize: 10, padding: '4px 8px' }}>📤 Gửi</button>}
                                                {v.status === 'SUBMITTED' && <button className="btn" onClick={() => advanceVoucher(v.id, 'approve')} style={{ fontSize: 10, padding: '4px 8px', color: '#f59e0b' }}>✅ Duyệt</button>}
                                                {v.status === 'APPROVED' && <button className="btn btn-primary" onClick={() => advanceVoucher(v.id, 'post')} style={{ fontSize: 10, padding: '4px 8px' }}>📌 Ghi sổ</button>}
                                                {['DRAFT', 'SUBMITTED'].includes(v.status) && <button className="btn" onClick={() => advanceVoucher(v.id, 'cancel')} style={{ fontSize: 10, padding: '4px 8px', color: '#ef4444' }}>❌</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ═══ TAB: Ledger ═══ */}
            {tab === 'ledger' && (
                <div className="card" style={{ overflowX: 'auto' }}>
                    {ledger.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                            Sổ cái rỗng. Phiếu đã ghi sổ (POSTED) sẽ xuất hiện ở đây.
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Thời gian</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Loại</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Biến thể</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>±SL</th>
                                    <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Tồn sau</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledger.map(e => (
                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fmtDate(e.createdAt)}</td>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <span style={{ ...TYPE_COLORS[e.type] ? { background: TYPE_COLORS[e.type].bg, color: TYPE_COLORS[e.type].text } : {}, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600 }}>
                                                {TYPE_COLORS[e.type]?.label || e.type}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', fontFamily: 'monospace' }}>{e.variantId.slice(0, 8)}</td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'right', fontWeight: 700, color: e.qty > 0 ? '#22c55e' : '#ef4444' }}>{e.qty > 0 ? `+${e.qty}` : e.qty}</td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'right', fontWeight: 600 }}>{e.balance}</td>
                                        <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{e.note || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* ═══ TAB: Stocktake ═══ */}
            {tab === 'stocktake' && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>📝 Kiểm kê kho</h2>
                        <button className="btn btn-primary" onClick={() => showToast('✅ Tạo đợt kiểm kê mới')}>➕ Tạo đợt kiểm kê</button>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                        Kiểm kê thực tế → So sánh với tồn hệ thống → Tự sinh phiếu điều chỉnh (ADJUST).
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                                <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>SKU</th>
                                <th style={{ textAlign: 'left', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Sản phẩm</th>
                                <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Tồn HT</th>
                                <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Thực tế</th>
                                <th style={{ textAlign: 'right', padding: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>Chênh lệch</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                    <td style={{ padding: 'var(--space-3)', fontFamily: 'monospace', fontSize: 'var(--text-sm)' }}>{s.sku}</td>
                                    <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>{s.name}</td>
                                    <td style={{ padding: 'var(--space-3)', textAlign: 'right', fontSize: 'var(--text-sm)' }}>{s.stockQty}</td>
                                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                                        <input type="number" defaultValue={s.stockQty} style={{ width: 60, padding: '4px', textAlign: 'right', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                    </td>
                                    <td style={{ padding: 'var(--space-3)', textAlign: 'right', fontWeight: 600, color: 'var(--text-muted)' }}>0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══ New Voucher Modal ═══ */}
            {showNewVoucher && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card" style={{ padding: 'var(--space-6)', width: '90%', maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>➕ Tạo phiếu mới</h2>
                            <button onClick={() => setShowNewVoucher(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24 }}>×</button>
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Loại phiếu</label>
                                <select value={newType} onChange={e => setNewType(e.target.value as 'RECEIPT' | 'ISSUE' | 'ADJUST')}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
                                    <option value="RECEIPT">📥 Nhập kho</option>
                                    <option value="ISSUE">📤 Xuất kho</option>
                                    <option value="ADJUST">🔧 Điều chỉnh</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Ghi chú</label>
                                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Lý do nhập/xuất/điều chỉnh..."
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }} />
                            </div>

                            <div>
                                <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', display: 'block' }}>Sản phẩm</label>
                                {newItems.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                                        <input type="text" value={item.variantId} onChange={e => { const n = [...newItems]; n[i].variantId = e.target.value; setNewItems(n); }}
                                            placeholder="Mã biến thể (variant ID)"
                                            style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                        <input type="number" value={item.qty} onChange={e => { const n = [...newItems]; n[i].qty = Number(e.target.value); setNewItems(n); }}
                                            placeholder="SL"
                                            style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                        <button onClick={() => setNewItems(newItems.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>
                                    </div>
                                ))}
                                <button className="btn" onClick={() => setNewItems([...newItems, { variantId: '', qty: 1, note: '' }])} style={{ fontSize: 'var(--text-xs)' }}>+ Thêm dòng</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                            <button className="btn" onClick={() => setShowNewVoucher(false)}>Hủy</button>
                            <button className="btn btn-primary" onClick={createVoucher}>✅ Tạo phiếu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-secondary)', border: '1px solid var(--gold-400)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
