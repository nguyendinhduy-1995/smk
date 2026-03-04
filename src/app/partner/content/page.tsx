'use client';

import { useState } from 'react';
import allProducts from '@/data/products.json';

const CONTENT_TYPES = [
    { id: 'caption', label: 'Bài đăng', icon: '📝', desc: 'Bài đăng Facebook, Instagram' },
    { id: 'video_script', label: 'Kịch bản video', icon: '🎬', desc: 'TikTok, Reels, YouTube Shorts' },
    { id: 'review', label: 'Mẫu đánh giá', icon: '⭐', desc: 'Đánh giá sản phẩm chi tiết' },
    { id: 'story', label: 'Ảnh Story', icon: '📱', desc: 'Instagram / Facebook Story' },
];

const TONES = [
    { id: 'casual', label: 'Thân thiện 🤗' },
    { id: 'professional', label: 'Chuyên nghiệp 💼' },
    { id: 'fun', label: 'Vui nhộn 🤪' },
];

const PLATFORMS = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'zalo', label: 'Zalo' },
];

const PRODUCT_LIST = (allProducts as any[]).slice(0, 20).map(p => ({
    slug: p.slug,
    name: p.name,
}));

export default function ContentGeneratorPage() {
    const [selectedType, setSelectedType] = useState('caption');
    const [selectedProduct, setSelectedProduct] = useState(PRODUCT_LIST[0]?.slug || '');
    const [selectedTone, setSelectedTone] = useState('casual');
    const [selectedPlatform, setSelectedPlatform] = useState('facebook');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generate = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/ai/content-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedType,
                    productSlug: selectedProduct,
                    tone: selectedTone,
                    platform: selectedPlatform,
                }),
            });
            const data = await res.json();
            setResult(data.content || data.error || 'Có lỗi xảy ra');
        } catch {
            setResult('⚠️ Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const copyResult = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                    Tạo Nội Dung
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    Tạo bài đăng, script video, mẫu review tự động cho sản phẩm
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--space-6)' }}>
                {/* Left: Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                    {/* Content Type */}
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Loại nội dung
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                            {CONTENT_TYPES.map((t) => (
                                <button
                                    key={t.id}
                                    className={`card ${selectedType === t.id ? 'card--active' : ''}`}
                                    onClick={() => setSelectedType(t.id)}
                                    style={{
                                        padding: 'var(--space-3)',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        border: selectedType === t.id ? '1px solid var(--gold-400)' : '1px solid var(--border-secondary)',
                                        background: selectedType === t.id ? 'rgba(212,168,83,0.08)' : 'var(--bg-secondary)',
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 4 }}>{t.label}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Sản phẩm
                        </label>
                        <select
                            className="input"
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                            {PRODUCT_LIST.map((p) => (
                                <option key={p.slug} value={p.slug}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tone */}
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Giọng điệu
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            {TONES.map((t) => (
                                <button
                                    key={t.id}
                                    className="filter-chip"
                                    onClick={() => setSelectedTone(t.id)}
                                    style={{
                                        background: selectedTone === t.id ? 'var(--gold-400)' : undefined,
                                        color: selectedTone === t.id ? '#0a0a0f' : undefined,
                                    }}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                            Nền tảng
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.id}
                                    className="filter-chip"
                                    onClick={() => setSelectedPlatform(p.id)}
                                    style={{
                                        background: selectedPlatform === p.id ? 'var(--gold-400)' : undefined,
                                        color: selectedPlatform === p.id ? '#0a0a0f' : undefined,
                                    }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading}>
                        {loading ? '⏳ Đang tạo...' : 'Tạo nội dung'}
                    </button>
                </div>

                {/* Right: Result */}
                <div>
                    <div
                        style={{
                            position: 'sticky',
                            top: 'calc(var(--header-height) + var(--space-4))',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Kết quả</label>
                            {result && (
                                <button className="btn btn-sm btn-ghost" onClick={copyResult}>
                                    {copied ? '✅ Đã sao chép' : '📋 Sao chép'}
                                </button>
                            )}
                        </div>
                        <div
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                minHeight: 300,
                                whiteSpace: 'pre-wrap',
                                fontSize: 'var(--text-sm)',
                                lineHeight: 1.7,
                                color: result ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontFamily: 'var(--font-mono, monospace)',
                            }}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                                    <div className="typing-indicator"><span /><span /><span /></div>
                                </div>
                            ) : result ? (
                                result
                            ) : (
                                'Chọn loại nội dung và sản phẩm, sau đó bấm "Tạo nội dung" để xem kết quả.'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
