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
