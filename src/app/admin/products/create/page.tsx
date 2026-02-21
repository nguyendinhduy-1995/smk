'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ═══ Types ═══ */
interface Variant { id?: string; frameColor: string; lensColor: string; sku: string; price: number; compareAtPrice: number; stockQty: number }
interface MediaItem { id?: string; url: string; alt: string; type: 'IMAGE' | 'VIDEO'; sort: number }
interface AIOutput {
    titleOptions?: string[]; shortDesc?: string; longDesc?: string; bullets?: string[];
    inferredAttributes?: Record<string, { value: string | null; confidence: number }>;
    suggestedSpecs?: Record<string, string | number | null>;
    tags?: string[]; seo?: { metaTitle: string; metaDescription: string; slug: string };
    social?: { facebook: string[]; tiktokCaption: string[]; zalo: string[] };
    disclaimers?: string[];
}

const BRANDS = ['Ray-Ban', 'Tom Ford', 'Oakley', 'Gucci', 'Lindberg', 'Prada', 'Versace', 'Hugo Boss', 'Khác'];
const CATEGORIES = ['Kính mắt', 'Kính râm', 'Kính thời trang', 'Kính cận', 'Kính chống ánh sáng xanh', 'Gọng kính'];
const SHAPES = ['SQUARE', 'ROUND', 'OVAL', 'CAT_EYE', 'AVIATOR', 'RECTANGLE', 'GEOMETRIC', 'BROWLINE'];
const MATERIALS = ['TITANIUM', 'TR90', 'ACETATE', 'METAL', 'MIXED', 'WOOD', 'PLASTIC'];
const GENDERS = ['UNISEX', 'MALE', 'FEMALE', 'KIDS'];
const STEPS = ['Thông tin', 'Hình ảnh', 'Biến thể', 'Giá', 'Kho'];

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function ProductCreateWizard() {
    // Wizard state
    const [step, setStep] = useState(0);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [publishErrors, setPublishErrors] = useState<string[]>([]);
    const [productId, setProductId] = useState<string | null>(null);

    // B1: Info
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [description, setDescription] = useState('');

    // Eyewear specs
    const [frameShape, setFrameShape] = useState('');
    const [material, setMaterial] = useState('');
    const [gender, setGender] = useState('');
    const [lensWidth, setLensWidth] = useState<number | ''>('');
    const [bridge, setBridge] = useState<number | ''>('');
    const [templeLength, setTempleLength] = useState<number | ''>('');

    // B2: Media
    const [media, setMedia] = useState<MediaItem[]>([]);

    // B3: Variants
    const [variants, setVariants] = useState<Variant[]>([
        { frameColor: '', lensColor: '', sku: '', price: 0, compareAtPrice: 0, stockQty: 0 },
    ]);

    // B5: Stock/Warehouse
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [warehouseLocation, setWarehouseLocation] = useState('');

    // AI Content Studio
    const [aiLoading, setAiLoading] = useState(false);
    const [aiOutput, setAiOutput] = useState<AIOutput | null>(null);
    const [aiTone, setAiTone] = useState('casual');
    const [aiChannel, setAiChannel] = useState('website');
    const [aiTab, setAiTab] = useState('titles');

    // SEO (from AI or manual)
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');

    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    /* ═══ Autosave ═══ */
    const autosave = useCallback(async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            const payload = {
                name, brand, category, tags, description,
                frameShape: frameShape || undefined, material: material || undefined,
                gender: gender || undefined,
                lensWidth: lensWidth || undefined, bridge: bridge || undefined, templeLength: templeLength || undefined,
                metaTitle, metaDesc,
                draftData: { step, media, variants, lowStockThreshold, warehouseLocation, aiOutput },
            };

            if (productId) {
                await fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: productId, ...payload }) });
            } else {
                const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const data = await res.json();
                if (data.product?.id) setProductId(data.product.id);
            }
            showToast('💾 Đã lưu nháp');
        } catch { showToast('⚠️ Lưu nháp thất bại'); }
        setSaving(false);
    }, [name, brand, category, tags, description, frameShape, material, gender, lensWidth, bridge, templeLength, metaTitle, metaDesc, step, media, variants, lowStockThreshold, warehouseLocation, aiOutput, productId]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(autosave, 3000);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [autosave]);

    /* ═══ AI Content ═══ */
    const generateAI = async () => {
        if (!name.trim()) { showToast('⚠️ Nhập tên sản phẩm trước'); return; }
        setAiLoading(true);
        try {
            const price = variants[0]?.price || 0;
            const imageUrls = media.filter(m => m.type === 'IMAGE').map(m => m.url).slice(0, 5);
            const res = await fetch('/api/admin/ai/product-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, imageUrls, channel: aiChannel, tone: aiTone }),
            });
            const data = await res.json();
            setAiOutput(data);
            showToast('✨ AI đã tạo nội dung!');
        } catch { showToast('⚠️ AI tạo nội dung thất bại'); }
        setAiLoading(false);
    };

    const applyAI = () => {
        if (!aiOutput) return;
        if (aiOutput.titleOptions?.[0] && !name) setName(aiOutput.titleOptions[0]);
        if (aiOutput.shortDesc) setDescription(aiOutput.shortDesc);
        if (aiOutput.tags) setTags(prev => [...new Set([...prev, ...aiOutput.tags!])]);
        if (aiOutput.seo) { setMetaTitle(aiOutput.seo.metaTitle); setMetaDesc(aiOutput.seo.metaDescription); }
        if (aiOutput.suggestedSpecs) {
            if (aiOutput.suggestedSpecs.frameShape) setFrameShape(String(aiOutput.suggestedSpecs.frameShape));
            if (aiOutput.suggestedSpecs.material) setMaterial(String(aiOutput.suggestedSpecs.material));
        }
        showToast('✅ Đã áp dụng nội dung AI');
    };

    /* ═══ Publish ═══ */
    const handlePublish = async () => {
        const errors: string[] = [];
        if (!name.trim()) errors.push('Thiếu tên sản phẩm');
        if (!media.length) errors.push('Cần ít nhất 1 ảnh');
        if (!variants.length || !variants[0].frameColor) errors.push('Cần ít nhất 1 biến thể');
        if (variants.some(v => v.price <= 0)) errors.push('Giá phải > 0');
        if (variants.some(v => v.stockQty < 0)) errors.push('Tồn kho không được âm');
        const skus = variants.map(v => v.sku).filter(Boolean);
        const dupes = skus.filter((s, i) => skus.indexOf(s) !== i);
        if (dupes.length) errors.push(`SKU trùng: ${dupes.join(', ')}`);

        if (errors.length) { setPublishErrors(errors); return; }

        if (productId) {
            const res = await fetch('/api/admin/products', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: productId, action: 'publish' }),
            });
            const data = await res.json();
            if (data.error) { setPublishErrors(data.errors || [data.error]); return; }
            showToast('🎉 Đã publish sản phẩm!');
        } else {
            showToast('⚠️ Lưu nháp trước khi publish');
        }
    };

    /* ═══ Variant helpers ═══ */
    const updateVariant = (idx: number, field: keyof Variant, value: string | number) => {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
    };

    const addVariant = () => {
        setVariants(prev => [...prev, { frameColor: '', lensColor: '', sku: '', price: prev[0]?.price || 0, compareAtPrice: 0, stockQty: 0 }]);
    };

    const removeVariant = (idx: number) => {
        if (variants.length <= 1) return;
        setVariants(prev => prev.filter((_, i) => i !== idx));
    };

    const autoGenSKU = (idx: number) => {
        const v = variants[idx];
        const b = (brand || 'SMK').substring(0, 3).toUpperCase();
        const c = v.frameColor.substring(0, 3).toUpperCase() || 'DEF';
        const sku = `${b}-${c}-${String(idx + 1).padStart(3, '0')}`;
        updateVariant(idx, 'sku', sku);
    };

    /* ═══ Media helpers ═══ */
    const addMediaUrl = () => {
        const url = prompt('Nhập URL ảnh/video:');
        if (url) {
            const isVideo = /\.(mp4|webm|mov)$/i.test(url);
            setMedia(prev => [...prev, { url, alt: name, type: isVideo ? 'VIDEO' : 'IMAGE', sort: prev.length }]);
        }
    };

    const removeMedia = (idx: number) => setMedia(prev => prev.filter((_, i) => i !== idx));

    const moveMedia = (from: number, to: number) => {
        if (to < 0 || to >= media.length) return;
        setMedia(prev => { const n = [...prev];[n[from], n[to]] = [n[to], n[from]]; return n.map((m, i) => ({ ...m, sort: i })); });
    };

    /* ═══ RENDER ═══ */
    return (
        <div className="animate-in" style={{ maxWidth: 960, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <nav style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                <Link href="/admin" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Admin</Link>
                {' › '}
                <Link href="/admin/products" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}>Sản phẩm</Link>
                {' › '}
                <span style={{ color: 'var(--text-primary)' }}>Đăng mới</span>
            </nav>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                    <h1 className="admin-page-title" style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>
                        ➕ Đăng sản phẩm mới
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        {saving ? '💾 Đang lưu...' : productId ? `📋 Draft ID: ${productId.slice(0, 8)}` : 'Chưa lưu'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={handlePublish} style={{ fontWeight: 700 }}>
                    🚀 Publish
                </button>
            </div>

            {/* Step indicators — horizontally scrollable on mobile */}
            <div className="admin-filter-scroll" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {STEPS.map((s, i) => (
                    <button key={i} onClick={() => setStep(i)} className="btn"
                        style={{
                            flex: '1 0 auto', padding: 'var(--space-2) var(--space-3)', minWidth: 72,
                            background: i === step ? 'var(--gold-500)' : i < step ? 'rgba(212,175,55,0.15)' : 'var(--bg-secondary)',
                            color: i === step ? '#000' : 'var(--text-primary)',
                            fontWeight: i === step ? 700 : 500,
                            borderRadius: 'var(--radius-lg)',
                            border: i === step ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
                            fontSize: 'var(--text-xs)',
                        }}>
                        <span style={{ fontSize: 9, display: 'block', opacity: 0.7 }}>B{i + 1}</span>
                        {s}
                    </button>
                ))}
            </div>

            {/* Publish errors */}
            {publishErrors.length > 0 && (
                <div className="card" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
                    <strong style={{ color: '#ef4444' }}>⚠️ Không thể publish:</strong>
                    <ul style={{ margin: 'var(--space-2) 0 0 var(--space-4)', color: '#ef4444' }}>
                        {publishErrors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                </div>
            )}

            {/* ═══ STEP B1: Info ═══ */}
            {step === 0 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>📝 Thông tin sản phẩm</h2>

                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Tên sản phẩm *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Aviator Classic Gold"
                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Thương hiệu</label>
                                <select value={brand} onChange={e => setBrand(e.target.value)}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
                                    <option value="">Chọn brand...</option>
                                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Danh mục</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}
                                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }}>
                                    <option value="">Chọn danh mục...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Mô tả</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Mô tả chi tiết sản phẩm..."
                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)', resize: 'vertical' }} />
                        </div>

                        {/* Tags */}
                        <div>
                            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Tags</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                                {tags.map((t, i) => (
                                    <span key={i} style={{ background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: 99, fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {t} <button onClick={() => setTags(tags.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                                    </span>
                                ))}
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); e.preventDefault(); } }}
                                    placeholder="Thêm tag + Enter"
                                    style={{ padding: '4px 8px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)', minWidth: 120 }} />
                            </div>
                        </div>

                        {/* Eyewear Specs */}
                        <details style={{ marginTop: 'var(--space-2)' }}>
                            <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--gold-400)' }}>🔬 Thông số kính chuyên ngành</summary>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Hình dáng gọng</label>
                                    <select value={frameShape} onChange={e => setFrameShape(e.target.value)} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                                        <option value="">—</option>
                                        {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Chất liệu</label>
                                    <select value={material} onChange={e => setMaterial(e.target.value)} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                                        <option value="">—</option>
                                        {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Giới tính</label>
                                    <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                                        <option value="">—</option>
                                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Lens Width (mm)</label>
                                    <input type="number" value={lensWidth} onChange={e => setLensWidth(e.target.value ? Number(e.target.value) : '')} placeholder="52"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Bridge (mm)</label>
                                    <input type="number" value={bridge} onChange={e => setBridge(e.target.value ? Number(e.target.value) : '')} placeholder="20"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Temple Length (mm)</label>
                                    <input type="number" value={templeLength} onChange={e => setTempleLength(e.target.value ? Number(e.target.value) : '')} placeholder="140"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                        </details>

                        {/* SEO */}
                        <details style={{ marginTop: 'var(--space-2)' }}>
                            <summary style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--gold-400)' }}>🔍 SEO</summary>
                            <div style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Meta Title</label>
                                    <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Tiêu đề SEO"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Meta Description</label>
                                    <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={2} placeholder="Mô tả SEO (150–160 ký tự)"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', resize: 'vertical' }} />
                                </div>
                            </div>
                        </details>
                    </div>
                </div>
            )}

            {/* ═══ STEP B2: Media ═══ */}
            {step === 1 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>📸 Hình ảnh & Video</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
                        {media.map((m, i) => (
                            <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: i === 0 ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)', aspectRatio: '1' }}>
                                {m.type === 'IMAGE' ? (
                                    <img src={m.url} alt={m.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <video src={m.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                                {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--gold-500)', color: '#000', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>CHÍNH</span>}
                                <div style={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 2 }}>
                                    <button onClick={() => moveMedia(i, i - 1)} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>◀</button>
                                    <button onClick={() => moveMedia(i, i + 1)} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>▶</button>
                                    <button onClick={() => removeMedia(i)} style={{ background: 'rgba(239,68,68,0.8)', border: 'none', color: '#fff', padding: '4px 6px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕</button>
                                </div>
                            </div>
                        ))}

                        {/* Add placeholder */}
                        <button onClick={addMediaUrl} style={{
                            aspectRatio: '1', border: '2px dashed var(--border-primary)', borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 'var(--text-sm)',
                        }}>
                            📁 Thêm ảnh/video
                        </button>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                        Ảnh đầu tiên = ảnh chính. Kéo thả hoặc nhập URL. Hỗ trợ JPG, PNG, WEBP, MP4.
                    </p>
                </div>
            )}

            {/* ═══ STEP B3: Variants ═══ */}
            {step === 2 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)' }}>🎨 Biến thể</h2>
                        <button className="btn btn-primary" onClick={addVariant} style={{ fontSize: 'var(--text-sm)' }}>+ Thêm biến thể</button>
                    </div>

                    {variants.map((v, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                                <span style={{ fontWeight: 600 }}>Biến thể #{i + 1}</span>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button className="btn" onClick={() => autoGenSKU(i)} style={{ fontSize: 'var(--text-xs)', padding: '4px 8px' }}>⚡ Auto SKU</button>
                                    {variants.length > 1 && <button onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>🗑️</button>}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Màu gọng *</label>
                                    <input type="text" value={v.frameColor} onChange={e => updateVariant(i, 'frameColor', e.target.value)} placeholder="Gold"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Màu tròng</label>
                                    <input type="text" value={v.lensColor} onChange={e => updateVariant(i, 'lensColor', e.target.value)} placeholder="Green G15"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>SKU</label>
                                    <input type="text" value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)} placeholder="RB-AVI-GOLD-55"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ STEP B4: Pricing ═══ */}
            {step === 3 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>💰 Giá bán</h2>

                    {variants.map((v, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'var(--bg-secondary)' }}>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{v.frameColor || `Biến thể #${i + 1}`} {v.lensColor ? `/ ${v.lensColor}` : ''}</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Giá bán *</label>
                                    <input type="number" value={v.price} onChange={e => updateVariant(i, 'price', Number(e.target.value))} placeholder="2990000"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                    {v.price > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{formatVND(v.price)}</span>}
                                </div>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Giá gốc (niêm yết)</label>
                                    <input type="number" value={v.compareAtPrice} onChange={e => updateVariant(i, 'compareAtPrice', Number(e.target.value))} placeholder="3990000"
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                    {v.compareAtPrice > v.price && <span style={{ fontSize: 'var(--text-xs)', color: '#22c55e' }}>-{Math.round((1 - v.price / v.compareAtPrice) * 100)}%</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ STEP B5: Stock ═══ */}
            {step === 4 && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>📦 Kho hàng</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Ngưỡng tồn thấp</label>
                            <input type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(Number(e.target.value))}
                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }} />
                        </div>
                        <div>
                            <label style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Vị trí kho</label>
                            <input type="text" value={warehouseLocation} onChange={e => setWarehouseLocation(e.target.value)} placeholder="A1-01"
                                style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', marginTop: 'var(--space-1)' }} />
                        </div>
                    </div>

                    {variants.map((v, i) => (
                        <div key={i} style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', background: 'var(--bg-secondary)' }}>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{v.sku || `Biến thể #${i + 1}`} — {v.frameColor}</span>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                <div>
                                    <label style={{ fontSize: 'var(--text-xs)' }}>Tồn đầu kỳ</label>
                                    <input type="number" value={v.stockQty} onChange={e => updateVariant(i, 'stockQty', Number(e.target.value))}
                                        style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }} />
                                    {v.stockQty < 0 && <span style={{ fontSize: 'var(--text-xs)', color: '#ef4444' }}>⚠️ Tồn âm!</span>}
                                    {v.stockQty > 0 && v.stockQty <= lowStockThreshold && <span style={{ fontSize: 'var(--text-xs)', color: '#f59e0b' }}>⚠️ Sắp hết hàng</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 'var(--space-4)' }}>
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                                        Giá: {v.price > 0 ? formatVND(v.price) : '—'} · Tồn giá trị: {formatVND(v.stockQty * v.price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ AI Content Studio ═══ */}
            <div className="card" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--gold-400)' }}>
                    ✨ AI Content Studio
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)' }}>Tone</label>
                        <select value={aiTone} onChange={e => setAiTone(e.target.value)} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                            <option value="casual">🏪 Bình dân</option>
                            <option value="premium">✨ Sang</option>
                            <option value="young">🔥 Trẻ</option>
                            <option value="kol_review">📱 KOL review</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)' }}>Kênh</label>
                        <select value={aiChannel} onChange={e => setAiChannel(e.target.value)} style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                            <option value="website">🌐 Website</option>
                            <option value="facebook">📘 Facebook</option>
                            <option value="tiktok">📱 TikTok</option>
                            <option value="zalo">💬 Zalo</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 'var(--text-xs)' }}>Ngôn ngữ</label>
                        <select disabled style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                            <option>🇻🇳 Tiếng Việt</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={generateAI} disabled={aiLoading} style={{ whiteSpace: 'nowrap' }}>
                            {aiLoading ? '⏳ Đang tạo...' : '🤖 AI tạo nội dung'}
                        </button>
                    </div>
                </div>

                {aiOutput && (
                    <>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                            {[
                                { key: 'titles', label: '📝 Titles' },
                                { key: 'desc', label: '📄 Mô tả' },
                                { key: 'bullets', label: '📌 Bullets' },
                                { key: 'specs', label: '🔬 Specs' },
                                { key: 'tags', label: '🏷️ Tags' },
                                { key: 'seo', label: '🔍 SEO' },
                                { key: 'social', label: '📱 Social' },
                            ].map(t => (
                                <button key={t.key} onClick={() => setAiTab(t.key)} className="btn"
                                    style={{ fontSize: 'var(--text-xs)', padding: '6px 12px', background: aiTab === t.key ? 'var(--gold-500)' : 'var(--bg-secondary)', color: aiTab === t.key ? '#000' : 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', minHeight: 120 }}>
                            {aiTab === 'titles' && aiOutput.titleOptions?.map((t, i) => (
                                <div key={i} style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{t}</span>
                                    <button className="btn" onClick={() => setName(t)} style={{ fontSize: 10, padding: '2px 8px' }}>Chọn</button>
                                </div>
                            ))}
                            {aiTab === 'desc' && (<>
                                <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Mô tả ngắn</h4>
                                <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>{aiOutput.shortDesc}</p>
                                <h4 style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>Mô tả dài</h4>
                                <p style={{ fontSize: 'var(--text-sm)' }}>{aiOutput.longDesc}</p>
                            </>)}
                            {aiTab === 'bullets' && aiOutput.bullets?.map((b, i) => <p key={i} style={{ padding: '4px 0', fontSize: 'var(--text-sm)' }}>• {b}</p>)}
                            {aiTab === 'specs' && aiOutput.inferredAttributes && Object.entries(aiOutput.inferredAttributes).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{key}</span>
                                    <span style={{ fontSize: 'var(--text-sm)' }}>
                                        {val.value || <em style={{ color: 'var(--text-muted)' }}>Cần xác nhận</em>}
                                        {val.confidence > 0 && <span style={{ marginLeft: 8, fontSize: 10, color: val.confidence > 0.7 ? '#22c55e' : '#f59e0b' }}>{Math.round(val.confidence * 100)}%</span>}
                                    </span>
                                </div>
                            ))}
                            {aiTab === 'tags' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>{aiOutput.tags?.map((t, i) => <span key={i} style={{ background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: 99, fontSize: 'var(--text-xs)' }}>{t}</span>)}</div>}
                            {aiTab === 'seo' && aiOutput.seo && (<>
                                <div style={{ marginBottom: 'var(--space-3)' }}><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Meta Title</label><p style={{ fontSize: 'var(--text-sm)' }}>{aiOutput.seo.metaTitle}</p></div>
                                <div style={{ marginBottom: 'var(--space-3)' }}><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Meta Description</label><p style={{ fontSize: 'var(--text-sm)' }}>{aiOutput.seo.metaDescription}</p></div>
                                <div><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>Slug</label><p style={{ fontSize: 'var(--text-sm)', color: 'var(--gold-400)' }}>/{aiOutput.seo.slug}</p></div>
                            </>)}
                            {aiTab === 'social' && aiOutput.social && (<>
                                {aiOutput.social.facebook?.map((p, i) => <div key={i} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(59,89,152,0.1)', borderRadius: 'var(--radius-md)' }}><span style={{ fontSize: 10, fontWeight: 700 }}>📘 Facebook #{i + 1}</span><p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{p}</p></div>)}
                                {aiOutput.social.tiktokCaption?.map((p, i) => <div key={i} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}><span style={{ fontSize: 10, fontWeight: 700 }}>📱 TikTok #{i + 1}</span><p style={{ fontSize: 'var(--text-sm)' }}>{p}</p></div>)}
                                {aiOutput.social.zalo?.map((p, i) => <div key={i} style={{ marginBottom: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(0,136,204,0.1)', borderRadius: 'var(--radius-md)' }}><span style={{ fontSize: 10, fontWeight: 700 }}>💬 Zalo #{i + 1}</span><p style={{ fontSize: 'var(--text-sm)' }}>{p}</p></div>)}
                            </>)}
                        </div>

                        {/* Disclaimers */}
                        {aiOutput.disclaimers?.length ? (
                            <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245,158,11,0.3)' }}>
                                <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: '#f59e0b' }}>⚠️ Lưu ý:</span>
                                {aiOutput.disclaimers.map((d, i) => <p key={i} style={{ fontSize: 'var(--text-xs)', color: '#f59e0b', marginTop: 2 }}>{d}</p>)}
                            </div>
                        ) : null}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            <button className="btn btn-primary" onClick={applyAI}>✅ Apply to fields</button>
                            <button className="btn" onClick={generateAI} disabled={aiLoading}>🔄 Regenerate</button>
                        </div>
                    </>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
                <button className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                    ← Bước trước
                </button>
                <button className="btn btn-primary" onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>
                    Bước sau →
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'var(--bg-secondary)', border: '1px solid var(--gold-400)', padding: 'var(--space-3) var(--space-5)', borderRadius: 'var(--radius-lg)', zIndex: 100, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
