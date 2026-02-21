'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message { role: 'user' | 'assistant'; text: string }

export default function AdminChatbot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: '👋 Xin chào! Tôi là AI Assistant. Hỏi tôi bất cứ điều gì về cửa hàng:\n\n• "Doanh thu hôm nay?"\n• "Đơn chờ xử lý?"\n• "SP nào sắp hết hàng?"\n• "Tạo báo cáo tuần"' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            // Simple pattern matching for common queries
            const lower = userMsg.toLowerCase();
            let reply = '';

            if (lower.includes('doanh thu') || lower.includes('revenue')) {
                const res = await fetch('/api/ai/forecast');
                const data = await res.json();
                reply = `📊 **Doanh thu:**\n• TB/ngày (30 ngày): ${new Intl.NumberFormat('vi-VN').format(data.avgDaily)}₫\n• Tổng 30 ngày: ${new Intl.NumberFormat('vi-VN').format(data.totalRevenue)}₫\n• Xu hướng: ${data.forecast.trend === 'up' ? '📈 Tăng' : data.forecast.trend === 'down' ? '📉 Giảm' : '➡️ Ổn định'}\n\n🤖 ${data.forecast.prediction}`;
            } else if (lower.includes('báo cáo') || lower.includes('report')) {
                const res = await fetch('/api/ai/sales-report');
                const data = await res.json();
                reply = `📋 **Báo cáo tuần:**\n• Tuần này: ${new Intl.NumberFormat('vi-VN').format(data.thisWeek.revenue)}₫ (${data.thisWeek.orders} đơn)\n• Tuần trước: ${new Intl.NumberFormat('vi-VN').format(data.lastWeek.revenue)}₫ (${data.lastWeek.orders} đơn)\n• Tăng trưởng: ${data.growth > 0 ? '+' : ''}${data.growth}%\n\n🤖 ${data.aiSummary}`;
            } else if (lower.includes('hết hàng') || lower.includes('tồn kho') || lower.includes('restock')) {
                const res = await fetch('/api/ai/restock');
                const data = await res.json();
                const alerts = data.alerts || [];
                reply = `📦 **Cảnh báo tồn kho:**\n${alerts.length > 0 ? alerts.map((a: { productName: string; daysUntilOut: number; suggestedRestock: number }) => `• ${a.productName}: ~${a.daysUntilOut} ngày (cần +${a.suggestedRestock})`).join('\n') : 'Tất cả SP đủ hàng.'}\n\n${data.aiSummary || ''}`;
            } else {
                reply = `🤔 Tôi hiểu bạn hỏi: "${userMsg}"\n\nHiện tại tôi hỗ trợ:\n• Doanh thu / báo cáo tuần\n• Tồn kho / SP sắp hết\n• Xu hướng bán hàng\n\nThử hỏi: "Doanh thu hôm nay?" hoặc "SP nào sắp hết?"`;
            }

            setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Lỗi kết nối. Thử lại!' }]);
        }
        setLoading(false);
    };

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} style={{
                position: 'fixed', bottom: 80, right: 16, zIndex: 90,
                width: 48, height: 48, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(168,85,247,0.4)',
            }}>🤖</button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 100,
            width: 'min(380px, calc(100vw - 32px))', height: 'min(480px, calc(100dvh - 100px))',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(168,85,247,0.3)',
            background: 'var(--bg-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
        }}>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))', borderBottom: '1px solid var(--border-primary)' }}>
                <span style={{ fontSize: 24 }}>🤖</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>Admin AI Assistant</div>
                    <div style={{ fontSize: 10, color: '#a855f7' }}>● Sẵn sàng hỗ trợ</div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
            </div>

            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        maxWidth: '85%', padding: '8px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                        ...(m.role === 'user' ? { alignSelf: 'flex-end', background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: '#fff' }
                            : { alignSelf: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }),
                    }}>{m.text}</div>
                ))}
                {loading && <div style={{ alignSelf: 'flex-start', padding: '8px 12px', borderRadius: 12, background: 'var(--bg-secondary)', fontSize: 12 }}>🔄 Đang tra cứu...</div>}
            </div>

            <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 6 }}>
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Hỏi về cửa hàng..."
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }} />
                <button onClick={send} disabled={loading || !input.trim()}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', background: '#a855f7', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>➤</button>
            </div>
        </div>
    );
}
