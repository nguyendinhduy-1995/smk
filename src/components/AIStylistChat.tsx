'use client';

import { useState, useRef, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; text: string }

export default function AIStylistChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', text: 'Chúc bạn ngày mới tốt lành! 👓✨ Mình là SMK Stylist — sẵn sàng giúp bạn tìm gọng kính ưng ý nhất. Hãy cho mình biết khuôn mặt, phong cách hoặc ngân sách bạn muốn nhé!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/stylist', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, history: messages.slice(-6) }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'Xin lỗi, tôi không hiểu. Bạn thử hỏi khác nhé!' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Lỗi kết nối. Vui lòng thử lại.' }]);
        }
        setLoading(false);
    };

    const quickQuestions = [
        '🔴 Kính cho mặt tròn?',
        '💰 Kính dưới 500k?',
        '🕶️ Kính râm nam',
        '👓 Kính cận thời trang',
    ];

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} aria-label="Tư vấn kính SMK" style={{
                position: 'fixed', bottom: 170, right: 16, zIndex: 90,
                width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
                color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(212,168,83,0.4)',
                animation: 'float 3s ease-in-out infinite',
            }}>
                👓
                <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed', bottom: 16, right: 16, zIndex: 100,
            width: 'min(380px, calc(100vw - 32px))', height: 'min(520px, calc(100dvh - 100px))',
            borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            border: '1px solid var(--border-primary)',
            background: 'var(--bg-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
                background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.05))',
                borderBottom: '1px solid var(--border-primary)',
            }}>
                <span style={{ fontSize: 28 }}>👓</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>SMK Stylist</div>
                    <div style={{ fontSize: 10, color: 'var(--success)' }}>● Online — Sẵn sàng tư vấn</div>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-muted)', padding: 4 }}>✕</button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        maxWidth: '85%', padding: '10px 14px', borderRadius: 16,
                        fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                        ...(m.role === 'user' ? {
                            alignSelf: 'flex-end', background: 'var(--gradient-gold)', color: '#000', fontWeight: 500,
                            borderBottomRightRadius: 4,
                        } : {
                            alignSelf: 'flex-start', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                            borderBottomLeftRadius: 4, border: '1px solid var(--border-primary)',
                        }),
                    }}>{m.text}</div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', fontSize: 13 }}>
                        <span style={{ animation: 'pulse 1s infinite' }}>💭 Đang suy nghĩ...</span>
                    </div>
                )}

                {/* Quick questions */}
                {messages.length <= 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {quickQuestions.map(q => (
                            <button key={q} onClick={() => { setInput(q); setTimeout(send, 50); }}
                                style={{
                                    padding: '6px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                                    border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.15s',
                                }}>{q}</button>
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 8 }}>
                <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && send()}
                    placeholder="Hỏi về kính mắt..."
                    style={{
                        flex: 1, padding: '10px 14px', borderRadius: 99,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                        color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    }} />
                <button onClick={send} disabled={loading || !input.trim()}
                    style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: input.trim() ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                        color: input.trim() ? '#000' : 'var(--text-muted)', fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>➤</button>
            </div>
        </div>
    );
}
