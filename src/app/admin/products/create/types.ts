// Shared types for product creation wizard

export interface MediaItem { url: string; type: 'IMAGE' | 'VIDEO'; sort: number; name?: string }

export interface VariantRow {
    id: string;
    frameColor: string;
    lensColor: string;
    size: string;
    sku: string;
    price: number | '';
    compareAtPrice: number | '';
    isActive: boolean;
    mediaIdx: number | null; // index into media[]
    // Variant-level spec overrides
    lensWidth: number | '';
    bridge: number | '';
    templeLength: number | '';
    lensHeight: number | '';
    frameWidth: number | '';
    weight: number | '';
    material: string;
}

export interface EyewearSpecs {
    lensWidth: number | '';
    bridge: number | '';
    templeLength: number | '';
    lensHeight: number | '';
    frameWidth: number | '';
    frameShape: string;
    material: string;
    frameType: string;
    fit: string;
    gender: string;
    weight: number | '';
    pdRange: string;
    uvProtection: string;
    blueLightBlock: boolean;
    compatibleLens: string[];
    specsUnknown: boolean; // mark "Chưa rõ"
}

export interface AIOutput {
    titleOptions?: string[]; shortDesc?: string; longDesc?: string; bullets?: string[];
    inferredAttributes?: Record<string, { value: string | null; confidence: number }>;
    suggestedSpecs?: Record<string, string | number | null>;
    tags?: string[]; seo?: { metaTitle: string; metaDescription: string; slug: string };
    social?: { facebook: string[]; tiktokCaption: string[]; zalo: string[] };
    disclaimers?: string[];
}

export const STEPS = [
    { label: 'Tên', icon: '📝', desc: 'Tên sản phẩm' },
    { label: 'Ảnh', icon: '📸', desc: 'Hình ảnh & Video' },
    { label: 'Biến thể', icon: '🎨', desc: 'Biến thể sản phẩm' },
    { label: 'Specs', icon: '📐', desc: 'Thông số kính' },
    { label: 'Giá', icon: '💰', desc: 'Giá bán' },
    { label: 'Kho', icon: '📦', desc: 'Tồn đầu kỳ' },
    { label: 'Nội dung', icon: '', desc: 'Mô tả & SEO' },
];

export const FRAME_COLORS = ['Đen', 'Nâu', 'Bạc', 'Vàng', 'Hồng', 'Xanh', 'Trắng', 'Đỏ', 'Tím', 'Kem', 'Trong suốt', 'Đồi mồi'];
export const LENS_COLORS = ['Đen', 'Nâu', 'Xám', 'Xanh', 'Hồng', 'Tím', 'Vàng', 'Gradient', 'Trong suốt', 'Gương'];
export const SIZES = ['S', 'M', 'L'];
export const FRAME_SHAPES = ['SQUARE', 'ROUND', 'OVAL', 'CAT_EYE', 'AVIATOR', 'RECTANGLE', 'GEOMETRIC', 'BROWLINE'];
export const MATERIALS = ['TITANIUM', 'TR90', 'ACETATE', 'METAL', 'MIXED', 'WOOD', 'PLASTIC'];
export const FRAME_TYPES = ['full-rim', 'half-rim', 'rimless'];
export const FITS = ['narrow', 'medium', 'wide'];
export const GENDERS = ['UNISEX', 'MALE', 'FEMALE', 'KIDS'];
export const COMPATIBLE_LENSES = ['single', 'progressive', 'bifocal', 'photochromic', 'polarized', 'blue-light'];

export const CATEGORIES = [
    { value: 'kinh-mat', label: 'Kính mắt', icon: '' },
    { value: 'kinh-ram', label: 'Kính râm', icon: '🕶️' },
    { value: 'gong-kinh', label: 'Gọng kính', icon: '🔲' },
    { value: 'trong-kinh', label: 'Tròng kính', icon: '🔵' },
    { value: 'kinh-ap-trong', label: 'Kính áp tròng', icon: '' },
    { value: 'kinh-bao-ho', label: 'Kính bảo hộ', icon: '🥽' },
    { value: 'kinh-thoi-trang', label: 'Kính thời trang', icon: '' },
    { value: 'phu-kien', label: 'Phụ kiện kính', icon: '🧴' },
];

export const SIZE_TEMPLATES: Record<string, { lensWidth: number; bridge: number; templeLength: number }> = {
    S: { lensWidth: 48, bridge: 16, templeLength: 135 },
    M: { lensWidth: 52, bridge: 18, templeLength: 140 },
    L: { lensWidth: 56, bridge: 20, templeLength: 145 },
};

export const formatVND = (n: number) => n ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '';

export function slugify(name: string) {
    return name.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function generateSKU(slug: string, color: string, size: string, idx: number) {
    const s = slug.split('-').slice(0, 2).map(w => w.slice(0, 3).toUpperCase()).join('');
    const c = color.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').slice(0, 3).toUpperCase();
    const sz = size || '';
    return `${s}-${c}${sz ? '-' + sz : ''}-${String(idx + 1).padStart(2, '0')}`;
}

export const defaultSpecs: EyewearSpecs = {
    lensWidth: '', bridge: '', templeLength: '', lensHeight: '', frameWidth: '',
    frameShape: '', material: '', frameType: '', fit: '', gender: '',
    weight: '', pdRange: '', uvProtection: '', blueLightBlock: false,
    compatibleLens: [], specsUnknown: false,
};

// Common styles
export const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-lg)',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', fontSize: 16, outline: 'none', transition: 'border-color 0.2s',
};
export const labelStyle: React.CSSProperties = {
    fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 6, display: 'block',
    color: 'var(--text-secondary)',
};
export const cardStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--border-primary)', padding: 'var(--space-5)',
};
export const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 99, fontSize: 'var(--text-xs)', fontWeight: 600,
    cursor: 'pointer', border: active ? '2px solid var(--gold-400)' : '1px solid var(--border-primary)',
    background: active ? 'rgba(212,168,83,0.15)' : 'var(--bg-tertiary)',
    color: active ? 'var(--gold-400)' : 'var(--text-primary)', transition: 'all 0.15s',
});
