'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import allProducts from '@/data/products.json';

type Product = {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string;
    image: string | null; images: string[]; description: string;
};

const products = allProducts as Product[];

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const STORAGE_KEY = 'smk_recently_viewed';

export default function TryOnPage() {
    const [selectedFrame, setSelectedFrame] = useState<Product | null>(null);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTab, setPickerTab] = useState<'store' | 'recent'>('store');
    const [pickerSearch, setPickerSearch] = useState('');
    const [pendingFrame, setPendingFrame] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Recently viewed products
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const viewed = JSON.parse(raw) as { slug: string }[];
            const matched = viewed
                .map((v) => products.find((p) => p.slug === v.slug))
                .filter((p): p is Product => !!p)
                .slice(0, 20);
            setRecentProducts(matched);
            // Auto-select first recently viewed if available
            if (matched.length > 0 && !selectedFrame) {
                setSelectedFrame(matched[0]);
            }
        } catch { /* silently fail */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Best sellers fallback
    const bestSellers = useMemo(() => [...products]
        .filter((p) => p.compareAt && p.compareAt > p.price && p.image)
        .sort((a, b) => {
            const dA = a.compareAt ? (a.compareAt - a.price) / a.compareAt : 0;
            const dB = b.compareAt ? (b.compareAt - b.price) / b.compareAt : 0;
            return dB - dA;
        })
        .slice(0, 6), []);

    // Auto-select best seller if no recently viewed
    useEffect(() => {
        if (!selectedFrame && bestSellers.length > 0) {
            setSelectedFrame(bestSellers[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bestSellers]);

    // Filtered products for picker
    const filteredProducts = useMemo(() => {
        if (pickerTab === 'recent') {
            if (!pickerSearch.trim()) return recentProducts;
            const q = pickerSearch.toLowerCase();
            return recentProducts.filter(p => p.name.toLowerCase().includes(q));
        }
        const q = pickerSearch.toLowerCase().trim();
        if (!q) return products.filter(p => p.image).slice(0, 30);
        return products.filter(p => p.image && p.name.toLowerCase().includes(q)).slice(0, 30);
    }, [pickerTab, pickerSearch, recentProducts]);

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
        if (!uploadedBase64 || !selectedFrame) return;
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
        link.download = `try-on-${selectedFrame?.slug || 'result'}-${Date.now()}.png`;
        link.click();
    };

    const handleReset = () => {
        setUploadedPhoto(null);
        setUploadedBase64(null);
        setResultImage(null);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openPicker = () => {
        setPendingFrame(selectedFrame);
        setPickerSearch('');
        setPickerOpen(true);
    };

    const confirmPicker = () => {
        if (pendingFrame) {
            setSelectedFrame(pendingFrame);
            setResultImage(null); // Reset result when changing frame
        }
        setPickerOpen(false);
    };

    // Product card used in both main view and picker
    const ProductCard = ({ product, isSelected, onClick, size = 'normal' }: {
        product: Product; isSelected: boolean; onClick: () => void; size?: 'normal' | 'small';
    }) => (
        <button
            className="card"
            onClick={onClick}
            style={{
                padding: 0, cursor: 'pointer', textAlign: 'center', overflow: 'hidden',
                transition: 'all 150ms',
                border: isSelected ? '2px solid var(--gold-400)' : '1px solid var(--border-secondary)',
                background: isSelected ? 'rgba(212,168,83,0.06)' : 'var(--bg-card)',
            }}
        >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1', background: 'var(--bg-secondary)' }}>
                {product.image ? (
                    <Image src={product.image} alt={product.name} fill sizes={size === 'small' ? '100px' : '140px'} style={{ objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👓</div>
                )}
                {isSelected && (
                    <div style={{
                        position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--gold-400)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, color: '#000', fontWeight: 700,
                    }}>✓</div>
                )}
            </div>
            <div style={{ padding: size === 'small' ? '4px 6px' : 'var(--space-2)' }}>
                <p style={{
                    fontSize: size === 'small' ? 10 : 11, fontWeight: 600, lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                    color: 'var(--text-primary)',
                }}>{product.name}</p>
                <p style={{ fontSize: size === 'small' ? 10 : 11, fontWeight: 700, color: 'var(--gold-400)', marginTop: 2 }}>
                    {formatVND(product.price)}
                </p>
            </div>
        </button>
    );

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)', overflow: 'hidden' }}>
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

            <div style={{ display: 'grid', gap: 'var(--space-6)', overflow: 'hidden' }}>
                {/* ── Photo area ── */}
                <div style={{ minWidth: 0 }}>
                    <div
                        className="card"
                        style={{
                            minHeight: 240, overflow: 'hidden',
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

                {/* ── Selected frame + frame selector ── */}
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    {/* Currently selected */}
                    {selectedFrame && (
                        <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', maxWidth: '100%', overflow: 'hidden' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'var(--bg-secondary)' }}>
                                {selectedFrame.image ? (
                                    <Image src={selectedFrame.image} alt={selectedFrame.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👓</div>
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                    {selectedFrame.name}
                                </p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold-400)', margin: 0 }}>
                                    {formatVND(selectedFrame.price)}
                                </p>
                            </div>
                            <button className="btn btn-ghost" onClick={openPicker} style={{ fontSize: 12, padding: '6px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                Đổi
                            </button>
                        </div>
                    )}

                    {/* Quick picks — recently viewed or best sellers */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
                            {recentProducts.length > 0 ? '👁 Kính bạn vừa xem' : '🔥 Kính bán chạy'}
                        </h3>
                        <button onClick={openPicker} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--gold-400)', fontSize: 12, fontWeight: 600,
                        }}>
                            Xem tất cả →
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: 'var(--space-2)',
                    }}>
                        {(recentProducts.length > 0 ? recentProducts.slice(0, 6) : bestSellers).map((frame) => (
                            <ProductCard
                                key={frame.id}
                                product={frame}
                                isSelected={selectedFrame?.id === frame.id}
                                onClick={() => { setSelectedFrame(frame); setResultImage(null); }}
                                size="small"
                            />
                        ))}
                    </div>

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                        {!selectedFrame && (
                            <button className="btn btn-primary btn-lg" onClick={openPicker} style={{ flex: 1, minHeight: 48, fontSize: 'var(--text-base)' }}>
                                👓 Chọn kính để thử
                            </button>
                        )}
                        {uploadedPhoto && !resultImage && selectedFrame && (
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleTryOn}
                                disabled={isProcessing}
                                style={{ flex: 1, minHeight: 48, fontSize: 'var(--text-base)' }}
                            >
                                🪞 Thử Kính
                            </button>
                        )}
                        {resultImage && selectedFrame && (
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

            {/* ── Product Picker Modal ── */}
            {pickerOpen && (
                <>
                    {/* Backdrop */}
                    <div onClick={() => setPickerOpen(false)} style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        zIndex: 300, backdropFilter: 'blur(4px)',
                    }} />
                    {/* Modal */}
                    <div style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0,
                        maxHeight: '85dvh', zIndex: 301,
                        background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                        display: 'flex', flexDirection: 'column',
                        border: '1px solid var(--border-primary)', borderBottom: 'none',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: 'var(--space-4)', borderBottom: '1px solid var(--border-secondary)',
                            flexShrink: 0,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 700 }}>👓 Chọn kính để thử</h3>
                                <button onClick={() => setPickerOpen(false)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--text-muted)', fontSize: 20, padding: 4,
                                }}>✕</button>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                <button
                                    onClick={() => setPickerTab('store')}
                                    style={{
                                        flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                        border: pickerTab === 'store' ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                        background: pickerTab === 'store' ? 'rgba(212,168,83,0.1)' : 'var(--bg-secondary)',
                                        color: pickerTab === 'store' ? 'var(--gold-400)' : 'var(--text-secondary)',
                                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                    }}
                                >
                                    🏪 Cửa hàng ({products.filter(p => p.image).length})
                                </button>
                                <button
                                    onClick={() => setPickerTab('recent')}
                                    style={{
                                        flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                                        border: pickerTab === 'recent' ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                                        background: pickerTab === 'recent' ? 'rgba(212,168,83,0.1)' : 'var(--bg-secondary)',
                                        color: pickerTab === 'recent' ? 'var(--gold-400)' : 'var(--text-secondary)',
                                        fontWeight: 600, fontSize: 13, cursor: 'pointer',
                                    }}
                                >
                                    👁 Đã xem ({recentProducts.length})
                                </button>
                            </div>

                            {/* Search */}
                            <input
                                type="text"
                                value={pickerSearch}
                                onChange={e => setPickerSearch(e.target.value)}
                                placeholder="Tìm kính theo tên..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                                    color: 'var(--text-primary)', fontSize: 14,
                                }}
                            />
                        </div>

                        {/* Product grid */}
                        <div style={{
                            flex: 1, overflowY: 'auto', padding: 'var(--space-4)',
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: 'var(--space-2)', alignContent: 'start',
                        }}>
                            {filteredProducts.length === 0 ? (
                                <div style={{
                                    gridColumn: '1 / -1', textAlign: 'center',
                                    padding: 'var(--space-8)', color: 'var(--text-muted)',
                                }}>
                                    <div style={{ fontSize: 40, marginBottom: 'var(--space-3)', opacity: 0.3 }}>
                                        {pickerTab === 'recent' ? '👁' : '🔍'}
                                    </div>
                                    <p style={{ fontSize: 13 }}>
                                        {pickerTab === 'recent' && recentProducts.length === 0
                                            ? 'Bạn chưa xem sản phẩm nào. Hãy duyệt cửa hàng trước!'
                                            : 'Không tìm thấy kính phù hợp'}
                                    </p>
                                </div>
                            ) : (
                                filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isSelected={pendingFrame?.id === product.id}
                                        onClick={() => setPendingFrame(product)}
                                        size="small"
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer with confirm */}
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)',
                            paddingBottom: 'max(var(--space-3), env(safe-area-inset-bottom))',
                            borderTop: '1px solid var(--border-secondary)',
                            display: 'flex', gap: 'var(--space-3)', alignItems: 'center',
                            background: 'var(--bg-primary)', flexShrink: 0,
                        }}>
                            {pendingFrame ? (
                                <>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {pendingFrame.name}
                                        </p>
                                        <p style={{ fontSize: 11, color: 'var(--gold-400)', fontWeight: 700 }}>
                                            {formatVND(pendingFrame.price)}
                                        </p>
                                    </div>
                                    <button className="btn btn-primary" onClick={confirmPicker} style={{ fontSize: 13, padding: '8px 20px', fontWeight: 700 }}>
                                        ✓ Xác nhận chọn
                                    </button>
                                </>
                            ) : (
                                <p style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                                    Chọn một kính để thử
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}

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
