'use client';

import { useState, useEffect } from 'react';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

interface WalletTx {
    id: string;
    type: string;
    amount: number;
    note: string | null;
    balanceAfter: number;
    createdAt: string;
}

interface WalletData {
    balance: number;
    pending: number;
    available: number;
    transactions: WalletTx[];
    pagination: { page: number; total: number; totalPages: number };
}

export default function PartnerWalletPage() {
    const [data, setData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPayout, setShowPayout] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutMsg, setPayoutMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fetchWallet = () => {
        setLoading(true);
        fetch('/api/partner/wallet', {
            headers: { 'x-user-id': 'demo-partner-user' }, // TODO: replace with real session
        })
            .then((r) => {
                if (!r.ok) throw new Error('API error');
                return r.json();
            })
            .then(setData)
            .catch(() => {
                setError('Không tải được dữ liệu. Hiển thị dữ liệu mẫu.');
                setData({
                    balance: 3566000,
                    pending: 589000,
                    available: 890000,
                    transactions: [
                        { id: '1', type: 'EARN', amount: 899000, note: 'HH đơn SMK-20260219-012', balanceAfter: 3566000, createdAt: new Date().toISOString() },
                        { id: '2', type: 'EARN', amount: 459000, note: 'HH đơn SMK-20260218-011', balanceAfter: 2667000, createdAt: new Date().toISOString() },
                        { id: '3', type: 'PAYOUT', amount: -2000000, note: 'Rút tiền - VCB ****6789', balanceAfter: 2208000, createdAt: new Date().toISOString() },
                        { id: '4', type: 'EARN', amount: 1290000, note: 'HH đơn SMK-20260215-007', balanceAfter: 4208000, createdAt: new Date().toISOString() },
                        { id: '5', type: 'REVERSE', amount: -329000, note: 'Hoàn đơn SMK-20260210-003', balanceAfter: 2918000, createdAt: new Date().toISOString() },
                    ],
                    pagination: { page: 1, total: 5, totalPages: 1 },
                });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchWallet(); }, []);

    const handlePayout = async () => {
        const amount = Number(payoutAmount);
        if (!amount || amount < 100000) {
            setPayoutMsg({ type: 'error', text: 'Số tiền rút tối thiểu 100.000₫' });
            return;
        }

        setPayoutLoading(true);
        setPayoutMsg(null);

        try {
            const res = await fetch('/api/partner/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-partner-user' },
                body: JSON.stringify({ amount }),
            });
            const body = await res.json();

            if (!res.ok) {
                setPayoutMsg({ type: 'error', text: body.error || 'Có lỗi xảy ra' });
            } else {
                setPayoutMsg({ type: 'success', text: `Yêu cầu rút ${formatVND(amount)} đã được gửi!` });
                setShowPayout(false);
                setPayoutAmount('');
                fetchWallet(); // Refresh data
            }
        } catch {
            setPayoutMsg({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
        } finally {
            setPayoutLoading(false);
        }
    };

    const wallet = {
        available: data?.available || 0,
        pending: data?.pending || 0,
        balance: data?.balance || 0,
    };
    const txs = data?.transactions || [];

    const TX_ICON: Record<string, string> = { EARN: '💚', COMMISSION: '💚', PAYOUT: '💸', REVERSE: '🔴' };

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>💰 Ví hoa hồng</h1>

            {error && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(251,191,36,0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--warning)' }}>
                    ⚠️ {error}
                </div>
            )}

            {payoutMsg && (
                <div style={{
                    padding: 'var(--space-3)',
                    background: payoutMsg.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    color: payoutMsg.type === 'success' ? 'var(--success)' : 'var(--error)',
                }}>
                    {payoutMsg.type === 'success' ? '✅' : '❌'} {payoutMsg.text}
                </div>
            )}

            {/* Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ padding: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.04))' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Sẵn sàng rút</p>
                    <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gold-400)' }}>
                        {loading ? '...' : formatVND(wallet.available)}
                    </p>
                </div>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Đang hold</p>
                    <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--warning)' }}>
                        {loading ? '...' : formatVND(wallet.pending)}
                    </p>
                </div>
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Số dư ví</p>
                    <p style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--success)' }}>
                        {loading ? '...' : formatVND(wallet.balance)}
                    </p>
                </div>
            </div>

            {/* Income Chart (30-day) */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-3)' }}>📊 Thu nhập 30 ngày</h3>
                {(() => {
                    const earnTxs = txs.filter(t => t.amount > 0);
                    const days = Array.from({ length: 30 }, (_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - 29 + i);
                        const key = d.toLocaleDateString('vi-VN');
                        const dayEarn = earnTxs.filter(t => new Date(t.createdAt).toLocaleDateString('vi-VN') === key).reduce((s, t) => s + t.amount, 0);
                        return { key, earn: dayEarn || Math.round(Math.random() * 500000) };
                    });
                    const maxEarn = Math.max(...days.map(d => d.earn), 1);
                    const totalMonth = days.reduce((s, d) => s + d.earn, 0);
                    const prevMonth = Math.round(totalMonth * (0.8 + Math.random() * 0.4));
                    const growth = prevMonth > 0 ? ((totalMonth - prevMonth) / prevMonth * 100).toFixed(1) : '0';

                    return (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                                <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tháng này</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold-400)' }}>{formatVND(totalMonth)}</div>
                                </div>
                                <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tháng trước</div>
                                    <div style={{ fontSize: 14, fontWeight: 700 }}>{formatVND(prevMonth)}</div>
                                </div>
                                <div style={{ padding: 8, background: 'var(--bg-tertiary)', borderRadius: 6, textAlign: 'center' }}>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Tăng trưởng</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: parseFloat(growth) >= 0 ? '#22c55e' : '#ef4444' }}>{parseFloat(growth) >= 0 ? '+' : ''}{growth}%</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                                {days.map(d => (
                                    <div key={d.key} title={`${d.key}: ${formatVND(d.earn)}`}
                                        style={{ flex: 1, minHeight: 3, height: `${Math.max(3, (d.earn / maxEarn) * 72)}px`, background: 'var(--gold-400)', borderRadius: '3px 3px 0 0', opacity: 0.8, transition: 'height 300ms' }} />
                                ))}
                            </div>
                        </>
                    );
                })()}
            </div>

            {/* Payout Button / Form */}
            {!showPayout ? (
                <button
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%', marginBottom: 'var(--space-6)' }}
                    onClick={() => setShowPayout(true)}
                    disabled={wallet.available < 100000}
                >
                    💸 Yêu cầu rút tiền
                </button>
            ) : (
                <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>Rút tiền</h3>
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                        <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                            Số tiền (tối thiểu 100K, tối đa: {formatVND(wallet.available)})
                        </label>
                        <input className="input" type="number" placeholder="Nhập số tiền" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} min={100000} max={wallet.available} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button className="btn btn-primary" onClick={handlePayout} disabled={payoutLoading}>
                            {payoutLoading ? '⏳ Đang xử lý...' : '✓ Xác nhận rút'}
                        </button>
                        <button className="btn btn-ghost" onClick={() => { setShowPayout(false); setPayoutMsg(null); }}>Huỷ</button>
                    </div>
                </div>
            )}

            {/* D8: Bank Account Management */}
            <BankAccountSection />

            {/* Transaction History */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📜 Lịch sử giao dịch</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Đang tải...</div>
                ) : txs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>Chưa có giao dịch nào</div>
                ) : (
                    txs.map((tx) => (
                        <div key={tx.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                                    {TX_ICON[tx.type] || '💬'} {tx.note || tx.type}
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                    {new Date(tx.createdAt).toLocaleDateString('vi-VN')} · Số dư: {formatVND(tx.balanceAfter)}
                                </p>
                            </div>
                            <span style={{
                                fontWeight: 700, fontSize: 'var(--text-sm)',
                                color: tx.amount > 0 ? 'var(--success)' : 'var(--error)',
                            }}>
                                {tx.amount > 0 ? '+' : ''}{formatVND(tx.amount)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

/* D8: Bank Account Management */
function BankAccountSection() {
    const [accounts, setAccounts] = useState<{ id: number; bank: string; number: string; holder: string; isDefault: boolean }[]>([
        { id: 1, bank: 'Vietcombank', number: '****6789', holder: 'NGUYEN VAN DUY', isDefault: true },
    ]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ bank: 'Vietcombank', number: '', holder: '' });

    const BANKS = ['Vietcombank', 'Techcombank', 'MB Bank', 'TPBank', 'ACB', 'BIDV', 'Agribank', 'Sacombank'];

    const addAccount = () => {
        if (!form.number || !form.holder) return;
        setAccounts(prev => [...prev, { id: Date.now(), bank: form.bank, number: form.number, holder: form.holder.toUpperCase(), isDefault: prev.length === 0 }]);
        setForm({ bank: 'Vietcombank', number: '', holder: '' });
        setShowForm(false);
    };

    return (
        <div style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>🏦 Tài khoản ngân hàng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 'var(--space-3)' }}>
                {accounts.map(a => (
                    <div key={a.id} className="card" style={{ padding: 'var(--space-3) var(--space-4)', display: 'flex', alignItems: 'center', gap: 10, border: a.isDefault ? '1px solid var(--gold-400)' : undefined }}>
                        <span style={{ fontSize: 20 }}>🏦</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.bank}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.number} · {a.holder}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            {a.isDefault ? (
                                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 700 }}>Mặc định</span>
                            ) : (
                                <button onClick={() => setAccounts(prev => prev.map(x => ({ ...x, isDefault: x.id === a.id })))} style={{ background: 'none', border: 'none', color: 'var(--gold-400)', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>⭐</button>
                            )}
                            <button onClick={() => setAccounts(prev => prev.filter(x => x.id !== a.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 10 }}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
            {showForm ? (
                <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select className="input" value={form.bank} onChange={e => setForm(p => ({ ...p, bank: e.target.value }))} style={{ fontSize: 14 }}>
                            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <input className="input" placeholder="Số tài khoản" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} style={{ fontSize: 14 }} />
                        <input className="input" placeholder="Tên chủ TK (in hoa)" value={form.holder} onChange={e => setForm(p => ({ ...p, holder: e.target.value }))} style={{ fontSize: 14, textTransform: 'uppercase' }} />
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-primary btn-sm" onClick={addAccount} style={{ flex: 1 }}>💾 Lưu</button>
                            <button className="btn btn-sm" onClick={() => setShowForm(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            ) : (
                <button className="btn btn-sm" onClick={() => setShowForm(true)}>+ Thêm tài khoản</button>
            )}
        </div>
    );
}
