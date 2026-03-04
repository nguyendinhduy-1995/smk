'use client';

import { useState } from 'react';

const PRODUCTS = [
    {
        slug: 'aviator-classic-gold', name: 'Aviator Classic Gold', brand: 'Ray-Ban', price: '2.990.000₫',
        captions: [
            '🔥 Gọng kính HUYỀN THOẠI mà ai cũng phải có! Ray-Ban Aviator Classic Gold — sang trọng, hợp mọi khuôn mặt. Giá chỉ 2.990K (giảm từ 3.590K)! \n\n✅ Freeship từ 500K\n✅ Đổi trả 14 ngày\n✅ Bảo hành 1 năm\n\n👉 Inbox ngay hoặc bấm link để mua!',
            ' Tìm gọng kính VỪA SANG VỪA HỢP MẶT? Ray-Ban Aviator đây rồi! Kim loại vàng, nhẹ nhàng, đeo cả ngày không mỏi 💛\n\nGiá sale: 2.990K\nShip COD toàn quốc 🚚\n\n#kinhmat #raybanaviator #sieuthimatkinh',
            'NEW ARRIVAL Ray-Ban Aviator Classic Gold đã có tại SMK!\n\n🎩 Phong cách: Sang trọng, lịch lãm\n💰 Giá: 2.990.000₫\n📦 Free giao hàng\n\nBấm link 👇 để sở hữu ngay!',
        ],
        hashtags: '#kinhmat #rayban #aviator #kinhthitrang #sieuthimatkinh #gongkinh #sale #trending',
    },
    {
        slug: 'cat-eye-acetate-tortoise', name: 'Cat-Eye Acetate', brand: 'Tom Ford', price: '4.590.000₫',
        captions: [
            '💎 Tom Ford Cat-Eye — sang chảnh cho nàng! Gọng acetate tortoise siêu nhẹ, kiểu dáng nữ tính, nổi bật mọi outfit 🤩\n\nGiá: 4.590K\n✅ Hàng chính hãng\n✅ Bảo hành 1 năm\n\nInbox đặt ngay nàng ơi! 💕',
            '👑 Muốn trông SANG HƠN? Cat-Eye của Tom Ford chính là câu trả lời!\n\nChất liệu Acetate cao cấp, nhẹ nhàng, không đau tai 🌟\nGiá sale: 4.590K — ship COD\n\n#tomford #cateye #kinhnu #sieuthimatkinh',
        ],
        hashtags: '#tomford #cateye #kinhnu #kinhthitrang #sieuthimatkinh #luxury #fashion',
    },
    {
        slug: 'square-tr90-black', name: 'Square TR90 Black', brand: 'Oakley', price: '3.290.000₫',
        captions: [
            '🏃 Năng động, THỂ THAO, BỀN BỈ — Oakley Square TR90 Black! Chất liệu TR90 siêu nhẹ, uốn cong không gãy 💪\n\nGiá: 3.290K\n✅ Freeship\n✅ Đổi trả 14 ngày\n\nĐặt ngay! 👇',
        ],
        hashtags: '#oakley #kinhthethao #tr90 #sieuthimatkinh #gongkinh #nam #sport',
    },
];

export default function PartnerToolkitPage() {
    const [copied, setCopied] = useState<string | null>(null);
    const [activeProduct, setActiveProduct] = useState(0);
    const [aiCaption, setAiCaption] = useState<string | null>(null);

    const copyText = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const product = PRODUCTS[activeProduct];

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                📦 Bộ công cụ tiếp thị
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Caption + hashtag sẵn — chỉ cần Sao chép → Dán lên MXH
            </p>

            {/* Product selector */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)', scrollbarWidth: 'none' }}>
                {PRODUCTS.map((p, i) => (
                    <button
                        key={p.slug}
                        className={`sf-chip ${activeProduct === i ? 'sf-chip--active' : ''}`}
                        onClick={() => setActiveProduct(i)}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {p.brand} — {p.name}
                    </button>
                ))}
            </div>

            {/* Product info */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}></div>
                <div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', fontWeight: 600, textTransform: 'uppercase' }}>{product.brand}</p>
                    <p style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{product.name}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', fontWeight: 600 }}>{product.price}</p>
                </div>
            </div>

            {/* Captions */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📝 Caption sẵn</h2>

            {/* H1: AI Caption Generator */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(212,168,83,0.04))', border: '1px solid rgba(168,85,247,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>🤖 Tạo caption AI</span>
                    <button className="btn btn-sm btn-primary" onClick={() => {
                        const openers = ['🔥 HOT!', 'MỚI!', '💎 CAO CẤP!', '👑 PREMIUM!', ' SỐC!'];
                        const ctas = ['Inbox ngay!', 'Bấm link → mua liền!', 'DM để tư vấn!', 'Ship COD toàn quốc!', 'Sale chỉ hôm nay!'];
                        const benefits = ['✅ Freeship từ 500K', '✅ Đổi trả 14 ngày', '✅ Bảo hành 1 năm', '✅ Hàng chính hãng', '✅ Tặng hộp kính cao cấp'];
                        const r = (a: string[]) => a[Math.floor(Math.random() * a.length)];
                        const caption = `${r(openers)} ${product.name} — ${product.brand}\n\nGiá: ${product.price}\n${r(benefits)}\n${r(benefits)}\n\n👉 ${r(ctas)}\n\n${product.hashtags}`;
                        setAiCaption(caption);
                    }} style={{ fontSize: 11 }}>
                        🎲 Tạo caption mới
                    </button>
                </div>
                {aiCaption && (
                    <div style={{ marginTop: 8 }}>
                        <pre style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit', padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', marginBottom: 8 }}>{aiCaption}</pre>
                        <button className="btn btn-sm" onClick={() => copyText(aiCaption, 'ai-caption')} style={{ fontSize: 11 }}>
                            {copied === 'ai-caption' ? '✅ Đã sao chép!' : '📋 Sao chép'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {product.captions.map((caption, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
                        <pre style={{ fontSize: 'var(--text-sm)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginBottom: 'var(--space-3)' }}>
                            {caption}
                        </pre>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => copyText(caption, `caption-${i}`)}
                            style={{ minHeight: 40 }}
                        >
                            {copied === `caption-${i}` ? '✅ Đã sao chép!' : '📋 Sao chép caption'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Hashtags */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}># Hashtag</h2>
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)', lineHeight: 1.6, wordBreak: 'break-word' }}>
                    {product.hashtags}
                </p>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => copyText(product.hashtags, 'hashtags')}
                    style={{ marginTop: 'var(--space-3)', minHeight: 40 }}
                >
                    {copied === 'hashtags' ? '✅ Đã sao chép!' : '📋 Sao chép hashtag'}
                </button>
            </div>

            {/* Download Materials */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📥 Tải tài liệu</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {[
                    { icon: '🖼️', title: 'Ảnh SP chất lượng cao', desc: 'Ảnh sản phẩm 2000x2000 nền trắng', format: 'ZIP · ~15MB', action: '📥 Tải ảnh HD' },
                    { icon: '🎨', title: 'Banner template', desc: 'Banner FB/IG có logo đại lý', format: 'PSD + PNG · ~8MB', action: '📥 Tải banner' },
                    { icon: '📄', title: 'Bảng giá PDF', desc: 'Tự động cập nhật giá mới nhất', format: 'PDF · ~2MB', action: '📥 Tải bảng giá' },
                ].map(d => (
                    <div key={d.title} className="card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                        <span style={{ fontSize: 28 }}>{d.icon}</span>
                        <h3 style={{ fontSize: 13, fontWeight: 700, marginTop: 6, marginBottom: 4 }}>{d.title}</h3>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.4 }}>{d.desc}</p>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{d.format}</p>
                        <button className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={() => copyText(`Tải file: ${d.title}`, d.title)}>
                            {copied === d.title ? '✅ Sẵn sàng!' : d.action}
                        </button>
                    </div>
                ))}
            </div>

            {/* Combo copy */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(96,165,250,0.05))' }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📦 Sao chép combo (Caption + Hashtag)</p>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => copyText(`${product.captions[0]}\n\n${product.hashtags}`, 'combo')}
                    style={{ minHeight: 48 }}
                >
                    {copied === 'combo' ? '✅ Đã sao chép!' : '📋 Sao chép tất cả → Dán lên MXH'}
                </button>
            </div>
        </div>
    );
}
