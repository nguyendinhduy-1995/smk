'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import allProducts from '@/data/products.json';

type Product = {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string;
    image: string | null; images: string[]; description: string;
};

const products = allProducts as Product[];

// Best sellers fallback: highest discount first
const bestSellers = [...products]
    .filter((p) => p.compareAt && p.compareAt > p.price && p.image)
    .sort((a, b) => {
        const dA = a.compareAt ? (a.compareAt - a.price) / a.compareAt : 0;
        const dB = b.compareAt ? (b.compareAt - b.price) / b.compareAt : 0;
        return dB - dA;
    })
    .slice(0, 6);

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STORAGE_KEY = 'smk_recently_viewed';

export default function TryOnPage() {
    const [frames, setFrames] = useState<Product[]>(bestSellers);
    const [selectedFrame, setSelectedFrame] = useState<Product>(bestSellers[0]);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRecentlyViewed, setIsRecentlyViewed] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load recently viewed products on mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const viewed = JSON.parse(raw) as { slug: string }[];
            if (viewed.length === 0) return;

            // Match viewed slugs with actual products
            const matched = viewed
                .map((v) => products.find((p) => p.slug === v.slug))
                .filter((p): p is Product => !!p)
                .slice(0, 6);

            if (matched.length > 0) {
                setFrames(matched);
                setSelectedFrame(matched[0]);
                setIsRecentlyViewed(true);
            }
        } catch { /* silently fail */ }
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError('Ảnh quá lớn, vui lòng chọn ảnh dưới 10MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            setUploadedPhoto(dataUrl);
            const base64 = dataUrl.split(',')[1];
            setUploadedBase64(base64);
            setResultImage(null);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleTryOn = async () => {
        if (!uploadedBase64) return;
        setIsProcessing(true);
        setError(null);
        setResultImage(null);

        try {
            const res = await fetch('/api/try-on', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: uploadedBase64,
                    productName: selectedFrame.name,
                    productBrand: selectedFrame.category,
                    frameShape: selectedFrame.category,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Lỗi không xác định');
                return;
            }
            setResultImage(data.resultBase64 || data.resultUrl);
        } catch {
            setError('Không thể kết nối server. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `try-on-${selectedFrame.slug}-${Date.now()}.png`;
        link.click();
    };

    const handleReset = () => {
        setUploadedPhoto(null);
        setUploadedBase64(null);
        setResultImage(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                🪞 Thử Kính Online
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Upload ảnh khuôn mặt → chọn kính → xem kết quả thử kính
            </p>

            {/* Steps indicator */}
            <div style={{
                display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)',
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)',
            }}>
                <span style={{
                    padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
                    background: !uploadedPhoto ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                    color: !uploadedPhoto ? '#0a0a0f' : 'var(--text-secondary)',
                    fontWeight: 600,
                }}>1. Upload ảnh</span>
                <span style={{
                    padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
                    background: uploadedPhoto && !resultImage ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                    color: uploadedPhoto && !resultImage ? '#0a0a0f' : 'var(--text-secondary)',
                    fontWeight: 600,
                }}>2. Chọn kính</span>
                <span style={{
                    padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--radius-full)',
                    background: resultImage ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                    color: resultImage ? '#0a0a0f' : 'var(--text-secondary)',
                    fontWeight: 600,
                }}>3. Kết quả</span>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                {/* ── Photo area ── */}
                <div>
                    <div
                        className="card"
                        style={{
                            position: 'relative', minHeight: 300, overflow: 'hidden',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        {isProcessing ? (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <div style={{ fontSize: 48, marginBottom: 'var(--space-4)', animation: 'pulse 1.5s ease-in-out infinite' }}>🪞</div>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                    Đang xử lý ảnh...
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                                    Quá trình này mất khoảng 15-30 giây
                                </p>
                                <div style={{
                                    marginTop: 'var(--space-4)', height: 4, borderRadius: 2,
                                    background: 'var(--bg-tertiary)', overflow: 'hidden',
                                    maxWidth: 200, margin: 'var(--space-4) auto 0',
                                }}>
                                    <div style={{
                                        height: '100%', background: 'var(--gradient-gold)',
                                        animation: 'loading-bar 2s ease-in-out infinite',
                                        width: '60%',
                                    }} />
                                </div>
                            </div>
                        ) : resultImage ? (
                            <>
                                <img src={resultImage} alt="Kết quả thử kính" style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }} />
                                <div style={{
                                    position: 'absolute', bottom: 'var(--space-3)',
                                    display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', width: '100%', padding: '0 var(--space-3)',
                                }}>
                                    <button className="btn btn-primary" onClick={handleDownload} style={{ minHeight: 44 }}>
                                        📥 Tải ảnh
                                    </button>
                                    <button className="btn btn-secondary" onClick={handleReset} style={{ minHeight: 44 }}>
                                        🔄 Thử lại
                                    </button>
                                </div>
                            </>
                        ) : uploadedPhoto ? (
                            <>
                                <img src={uploadedPhoto} alt="Ảnh đã upload" style={{ width: '100%', maxHeight: 500, objectFit: 'contain' }} />
                                <button
                                    className="btn btn-ghost"
                                    onClick={handleReset}
                                    style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', minWidth: 44, minHeight: 44 }}
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <div style={{ fontSize: 64, marginBottom: 'var(--space-4)', opacity: 0.3 }}>📷</div>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                                    Upload ảnh khuôn mặt để bắt đầu
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                                    Chụp thẳng mặt, ánh sáng tốt để có kết quả đẹp nhất
                                </p>
                                <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} style={{ minHeight: 44 }}>
                                    📁 Chọn ảnh từ máy
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            marginTop: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--danger)',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* ── Frame selector — recently viewed or best sellers ── */}
                <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                        {isRecentlyViewed ? '👓 Kính bạn vừa xem' : '🔥 Kính bán chạy'}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        {isRecentlyViewed ? 'Chọn gọng bạn muốn thử' : 'Xem thêm sản phẩm ở trang chủ để có gợi ý riêng'}
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 'var(--space-3)',
                    }}>
                        {frames.map((frame) => (
                            <button
                                key={frame.id}
                                className="card"
                                onClick={() => setSelectedFrame(frame)}
                                style={{
                                    padding: 0,
                                    cursor: 'pointer',
                                    border: selectedFrame.id === frame.id
                                        ? '2px solid var(--gold-400)'
                                        : '1px solid var(--border-secondary)',
                                    background: selectedFrame.id === frame.id
                                        ? 'rgba(212,168,83,0.06)'
                                        : 'var(--bg-card)',
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    transition: 'all 150ms',
                                }}
                            >
                                {/* Thumbnail */}
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'var(--bg-secondary)' }}>
                                    {frame.image ? (
                                        <Image
                                            src={frame.image}
                                            alt={frame.name}
                                            fill
                                            sizes="140px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👓</div>
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ padding: 'var(--space-2)' }}>
                                    <p style={{
                                        fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                                        overflow: 'hidden', textOverflow: 'ellipsis',
                                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                                        color: 'var(--text-primary)',
                                    }}>{frame.name}</p>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-400)', marginTop: 2 }}>
                                        {formatVND(frame.price)}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {uploadedPhoto && !resultImage && (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleTryOn}
                                disabled={isProcessing}
                                style={{ flex: 1, minHeight: 48, fontSize: 'var(--text-base)' }}
                            >
                                🪞 Thử Kính
                            </button>
                        )}
                        {resultImage && (
                            <Link
                                href={`/p/${selectedFrame.slug}`}
                                className="btn btn-primary btn-lg"
                                style={{ flex: 1, minHeight: 48, textAlign: 'center', textDecoration: 'none', fontSize: 'var(--text-base)' }}
                            >
                                🛒 Mua ngay
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div style={{
                marginTop: 'var(--space-8)', padding: 'var(--space-4)',
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6,
            }}>
                <p>💡 <strong>Lưu ý:</strong></p>
                <ul style={{ paddingLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                    <li>Ảnh kết quả là minh họa, kính thực tế có thể khác đôi chút</li>
                    <li>Giới hạn 5 lần thử/ngày</li>
                    <li>Ảnh của bạn chỉ dùng để tạo kết quả, không lưu trữ</li>
                </ul>
            </div>
        </div>
    );
}
