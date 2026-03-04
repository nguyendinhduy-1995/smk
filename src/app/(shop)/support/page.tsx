'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    products?: ProductSuggestion[];
    timestamp: Date;
}

interface ProductSuggestion {
    slug: string;
    name: string;
    brand: string;
    price: number;
    reason: string;
    frameShape: string;
    faceMatch: string[];
}

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const QUICK_PROMPTS = [
    '👔 Kính đi làm công sở',
    '🏖️ Kính đi chơi, đi biển',
    '📸 Kính chụp ảnh sống ảo',
    '🔵 Kính chống ánh sáng xanh',
    '👩 Gợi ý kính cho mặt tròn',
    '🧔 Gọng nam thanh lịch',
];

const INTRO: Message = {
    id: 'intro',
    role: 'assistant',
    content: 'Xin chào! 👋 Tôi là **Chuyên Viên Tư Vấn** của Siêu Thị Mắt Kính.\n\nTôi có thể giúp bạn:\n- 🔍 Tìm kiểu kính phù hợp khuôn mặt\n- 👗 Gợi ý theo phong cách ăn mặc\n- 📐 Tư vấn size phù hợp\n- 🎨 Phối màu gọng + tròng\n\nBạn muốn tìm kính cho dịp nào?',
    timestamp: new Date(),
};

export default function StylistPage() {
    const [messages, setMessages] = useState<Message[]>([INTRO]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim()) return;
        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/stylist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
                }),
            });
            const data = await res.json();

            const assistantMsg: Message = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.reply || 'Xin lỗi, tôi chưa hiểu. Bạn có thể mô tả thêm không?',
                products: data.products || [],
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: '⚠️ Có lỗi xảy ra, vui lòng thử lại.',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100dvh - var(--header-height) - var(--mobile-nav-height, 0px))',
                maxWidth: 720,
                margin: '0 auto',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: 'var(--space-4)',
                    borderBottom: '1px solid var(--border-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                }}
            >
                <div
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                    }}
                >
                    
                </div>
                <div>
                    <h1 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Chuyên Viên Tư Vấn</h1>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success)' }}>● Online — Sẵn sàng tư vấn</p>
                </div>
            </div>

            {/* Messages */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-4)',
                }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: 'var(--space-2)',
                        }}
                    >
                        {msg.role === 'assistant' && (
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--gradient-gold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 14,
                                    flexShrink: 0,
                                }}
                            >
                                
                            </div>
                        )}
                        <div style={{ maxWidth: '80%' }}>
                            <div
                                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background:
                                        msg.role === 'user'
                                            ? 'var(--gradient-gold)'
                                            : 'var(--bg-secondary)',
                                    color: msg.role === 'user' ? '#0a0a0f' : 'var(--text-primary)',
                                    fontSize: 'var(--text-sm)',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap',
                                }}
                            >
                                {msg.content.split('**').map((part, i) =>
                                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )}
                            </div>

                            {/* Product suggestions */}
                            {msg.products && msg.products.length > 0 && (
                                <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                    {msg.products.map((p) => (
                                        <Link
                                            key={p.slug}
                                            href={`/p/${p.slug}`}
                                            className="card"
                                            style={{
                                                padding: 'var(--space-3)',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                gap: 'var(--space-3)',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 'var(--radius-md)',
                                                    background: 'var(--bg-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 24,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600 }}>{p.brand}</p>
                                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{p.name}</p>
                                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{p.reason}</p>
                                            </div>
                                            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gold-400)', whiteSpace: 'nowrap' }}>
                                                {formatVND(p.price)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--gradient-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                            }}
                        >
                            
                        </div>
                        <div className="typing-indicator">
                            <span /><span /><span />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
                <div style={{ padding: '0 var(--space-4)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                        {QUICK_PROMPTS.map((prompt) => (
                            <button
                                key={prompt}
                                className="filter-chip"
                                onClick={() => sendMessage(prompt)}
                                style={{ fontSize: 'var(--text-xs)' }}
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div
                style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderTop: '1px solid var(--border-secondary)',
                    display: 'flex',
                    gap: 'var(--space-2)',
                    background: 'var(--bg-primary)',
                }}
            >
                <button
                    className="btn btn-ghost btn-icon"
                    title="Gửi ảnh khuôn mặt"
                    style={{ flexShrink: 0 }}
                >
                    📷
                </button>
                <input
                    className="input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Mô tả nhu cầu của bạn..."
                    style={{ flex: 1, borderRadius: 'var(--radius-xl)' }}
                />
                <button
                    className="btn btn-primary btn-icon"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping}
                    style={{ flexShrink: 0, borderRadius: 'var(--radius-full)' }}
                >
                    ↑
                </button>
            </div>
        </div>
    );
}
