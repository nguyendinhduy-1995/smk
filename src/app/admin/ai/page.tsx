'use client';

import { useState, useEffect, useCallback } from 'react';

interface AIFeature {
    name: string;
    desc: string;
    endpoint: string;
    enabled: boolean;
    usage: string;
    iconSvg: React.ReactNode;
    provider: 'openai' | 'google';
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    customInstructions: string;
}

/* ── SVG Icon helpers ── */
const svgProps = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const Icons = {
    chat: <svg {...svgProps}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth={2.5} /></svg>,
    target: <svg {...svgProps}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    camera: <svg {...svgProps}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    edit: <svg {...svgProps}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    glasses: <svg {...svgProps}><circle cx="6" cy="15" r="4" /><circle cx="18" cy="15" r="4" /><path d="M10 15h4" /><path d="M2 15V9a2 2 0 0 1 2-2" /><path d="M22 15V9a2 2 0 0 0-2-2" /></svg>,
    box: <svg {...svgProps}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg>,
    undo: <svg {...svgProps}><path d="M3 10h10a5 5 0 0 1 5 5v2" /><path d="M3 10l5-5M3 10l5 5" /></svg>,
    users: <svg {...svgProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    globe: <svg {...svgProps}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" /></svg>,
    shield: <svg {...svgProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4M12 16h.01" /></svg>,
    headset: <svg {...svgProps}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>,
    trend: <svg {...svgProps}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
};

const OPENAI_MODELS = [
    { id: 'gpt-5.2', label: 'GPT-5.2 (Latest)', tier: 'flagship' },
    { id: 'gpt-5', label: 'GPT-5', tier: 'flagship' },
    { id: 'gpt-5-mini', label: 'GPT-5 Mini', tier: 'flagship' },
    { id: 'o3', label: 'o3 (Reasoning)', tier: 'flagship' },
    { id: 'o3-mini', label: 'o3-mini (Reasoning Fast)', tier: 'flagship' },
    { id: 'o1', label: 'o1 (Reasoning)', tier: 'premium' },
    { id: 'o1-mini', label: 'o1-mini', tier: 'premium' },
    { id: 'gpt-4.1', label: 'GPT-4.1', tier: 'premium' },
    { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini', tier: 'standard' },
    { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano (Fast)', tier: 'standard' },
    { id: 'gpt-4o', label: 'GPT-4o', tier: 'standard' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', tier: 'standard' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', tier: 'standard' },
];
const GOOGLE_MODELS = [
    { id: 'gemini-3.0-pro', label: 'Gemini 3.0 Pro (Latest)', tier: 'flagship' },
    { id: 'gemini-3.0-flash', label: 'Gemini 3.0 Flash', tier: 'flagship' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'premium' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'premium' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', tier: 'standard' },
    { id: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', tier: 'standard' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', tier: 'standard' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', tier: 'standard' },
];

const TIER_COLORS: Record<string, string> = {
    flagship: '#ff6b6b',
    premium: 'var(--gold-400)',
    standard: 'var(--text-muted)',
};

const INITIAL_FEATURES: AIFeature[] = [
    { name: 'AI Stylist Chat', desc: 'Tư vấn kính tự động bằng chatbot AI. Phát hiện ý định từ tiếng Việt.', endpoint: '/api/ai/stylist', enabled: true, usage: '124 cuộc hội thoại', iconSvg: Icons.chat, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.7, maxTokens: 1024, systemPrompt: 'Bạn là chuyên gia tư vấn kính mắt tại Siêu Thị Mắt Kính. Hãy tư vấn chuyên nghiệp, thân thiện bằng tiếng Việt.', customInstructions: '' },
    { name: 'Personalization Engine', desc: 'Gợi ý sản phẩm dựa trên lịch sử xem, mua hàng và xu hướng.', endpoint: '/api/ai/personalize', enabled: true, usage: '856 API calls/ngày', iconSvg: Icons.target, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 512, systemPrompt: 'Phân tích hành vi mua hàng và gợi ý sản phẩm kính mắt phù hợp. Trả JSON.', customInstructions: '' },
    { name: 'Visual Search', desc: 'Tìm kiếm sản phẩm bằng hình ảnh. Upload ảnh kính → trả kết quả matching.', endpoint: '/api/ai/visual-search', enabled: true, usage: '45 searches/ngày', iconSvg: Icons.camera, provider: 'openai', model: 'gpt-4o', temperature: 0.2, maxTokens: 256, systemPrompt: 'Phân tích hình ảnh kính mắt và mô tả chi tiết đặc điểm: hình dáng, chất liệu, màu sắc, phong cách.', customInstructions: '' },
    { name: 'Content Generator', desc: 'Tạo caption, script video, mẫu review tự động từ thông tin sản phẩm.', endpoint: '/api/ai/content-gen', enabled: true, usage: '67 nội dung tạo', iconSvg: Icons.edit, provider: 'openai', model: 'gpt-4.1', temperature: 0.8, maxTokens: 4096, systemPrompt: 'Tạo nội dung marketing sáng tạo cho sản phẩm kính mắt. Viết bằng tiếng Việt, phong cách trẻ trung.', customInstructions: '' },
    { name: 'AR Try-On', desc: 'Thử kính ảo bằng camera hoặc ảnh. Giữ 100% gương mặt gốc.', endpoint: '/try-on', enabled: true, usage: '312 lần thử', iconSvg: Icons.glasses, provider: 'openai', model: 'gpt-4o', temperature: 0, maxTokens: 256, systemPrompt: 'Xử lý ảnh thử kính. Giữ nguyên 100% gương mặt, chỉ phủ kính lên.', customInstructions: '' },
    { name: 'Smart Restock', desc: 'Phân tích tốc độ bán → dự đoán ngày hết hàng → gợi ý nhập thêm.', endpoint: '/api/ai/restock', enabled: true, usage: 'Real-time', iconSvg: Icons.box, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 512, systemPrompt: 'Phân tích dữ liệu bán hàng và tồn kho. Dự đoán ngày hết hàng. Trả JSON.', customInstructions: '' },
    { name: 'Auto-Categorize Returns', desc: 'AI đọc lý do đổi trả → tự phân loại → gợi ý approve/reject.', endpoint: '/api/ai/categorize-return', enabled: true, usage: 'Real-time', iconSvg: Icons.undo, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 256, systemPrompt: 'Phân loại lý do đổi trả và đưa ra khuyến nghị approve/reject kèm giải thích.', customInstructions: '' },
    { name: 'Customer Insights', desc: 'Phân tích hành vi mua → dự đoán churn risk, gợi ý upsell.', endpoint: '/api/ai/customer-insights', enabled: true, usage: 'On-demand', iconSvg: Icons.users, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.4, maxTokens: 1024, systemPrompt: 'Phân tích hành vi khách hàng, tính churn risk và đề xuất chiến lược giữ chân. Trả JSON.', customInstructions: '' },
    { name: 'Smart SEO Writer', desc: 'AI sinh meta title, description, keywords tối ưu cho Google.vn.', endpoint: '/api/ai/seo-writer', enabled: true, usage: 'On-demand', iconSvg: Icons.globe, provider: 'openai', model: 'gpt-4.1-mini', temperature: 0.6, maxTokens: 512, systemPrompt: 'Viết meta title, description, keywords SEO tối ưu cho Google.vn. Ngôn ngữ tiếng Việt.', customInstructions: '' },
    { name: 'Fraud AI Analyzer', desc: 'Phân tích pattern đơn hàng bất thường → risk score.', endpoint: '/api/ai/fraud-analyze', enabled: true, usage: 'On-demand', iconSvg: Icons.shield, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.1, maxTokens: 512, systemPrompt: 'Phân tích đơn hàng tìm dấu hiệu gian lận. Trả risk score 0-100 kèm giải thích.', customInstructions: '' },
    { name: 'Auto Reply Support', desc: 'AI đọc ticket CSKH → gợi ý câu trả lời. Copy 1 click.', endpoint: '/api/ai/support-reply', enabled: true, usage: 'On-demand', iconSvg: Icons.headset, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.5, maxTokens: 512, systemPrompt: 'Bạn là nhân viên CSKH Siêu Thị Mắt Kính. Đọc ticket và soạn câu trả lời chuyên nghiệp, lịch sự.', customInstructions: '' },
    { name: 'Sales Forecast', desc: 'Phân tích 30 ngày → dự đoán 7 ngày tới → trend.', endpoint: '/api/ai/forecast', enabled: true, usage: 'Real-time', iconSvg: Icons.trend, provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 512, systemPrompt: 'Phân tích dữ liệu bán hàng 30 ngày. Dự đoán doanh thu 7 ngày tới. Trả JSON.', customInstructions: '' },
];

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            aria-label={enabled ? 'Tắt tính năng' : 'Bật tính năng'}
            style={{
                width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', padding: 2,
                background: enabled ? 'linear-gradient(135deg, var(--gold-400), var(--gold-600))' : 'var(--bg-tertiary)',
                transition: 'background 250ms ease', flexShrink: 0, position: 'relative',
            }}
        >
            <span style={{
                display: 'block', width: 22, height: 22, borderRadius: '50%',
                background: enabled ? '#fff' : 'var(--text-muted)',
                transform: enabled ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 250ms ease, background 250ms ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
        </button>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
    color: 'var(--text-primary)', outline: 'none',
};
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' };

export default function AdminAIPage() {
    const [features, setFeatures] = useState<AIFeature[]>(INITIAL_FEATURES);
    const [toast, setToast] = useState<string | null>(null);
    const [openaiKey, setOpenaiKey] = useState('');
    const [googleKey, setGoogleKey] = useState('');
    const [activeProvider, setActiveProvider] = useState<'openai' | 'google'>('openai');
    const [showKeyOpenai, setShowKeyOpenai] = useState(false);
    const [showKeyGoogle, setShowKeyGoogle] = useState(false);
    const [saving, setSaving] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

    // Load saved config on mount
    useEffect(() => {
        fetch('/api/admin/ai', { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                if (data.openaiKey) setOpenaiKey(data.openaiKey);
                if (data.googleKey) setGoogleKey(data.googleKey);
                if (data.features) {
                    setFeatures(prev => prev.map(f => {
                        const saved = data.features[f.endpoint];
                        if (!saved) return f;
                        return { ...f, ...saved };
                    }));
                }
            })
            .catch(() => { });
    }, []);

    const toggleFeature = (index: number) => {
        setFeatures((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], enabled: !updated[index].enabled };
            showToast(`${updated[index].name} — ${updated[index].enabled ? 'Đã bật' : 'Đã tắt'}`);
            return updated;
        });
    };

    const updateFeature = (index: number, field: keyof AIFeature, value: any) => {
        setFeatures((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const saveConfig = async () => {
        setSaving(true);
        try {
            const featuresMap: Record<string, any> = {};
            features.forEach(f => {
                featuresMap[f.endpoint] = {
                    enabled: f.enabled,
                    provider: f.provider,
                    model: f.model,
                    temperature: f.temperature,
                    maxTokens: f.maxTokens,
                    systemPrompt: f.systemPrompt,
                    customInstructions: f.customInstructions,
                };
            });
            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ openaiKey, googleKey, features: featuresMap }),
            });
            if (res.ok) {
                showToast('✓ Đã lưu cấu hình AI thành công');
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(`✗ Lỗi: ${err.error || 'Không thể lưu'}`);
            }
        } catch {
            showToast('✗ Lỗi kết nối server');
        } finally {
            setSaving(false);
        }
    };

    const testApiKey = async (provider: 'openai' | 'google') => {
        const key = provider === 'openai' ? openaiKey : googleKey;
        if (!key || key.length < 10 || key.includes('•')) {
            showToast('⚠ Vui lòng nhập API Key hợp lệ (không phải key đã ẩn)');
            return;
        }
        showToast(`🔄 Đang test ${provider === 'openai' ? 'OpenAI' : 'Google'} API Key...`);
        try {
            if (provider === 'openai') {
                const res = await fetch('https://api.openai.com/v1/models', {
                    headers: { Authorization: `Bearer ${key}` },
                });
                showToast(res.ok ? '✓ OpenAI API Key hợp lệ!' : `✗ OpenAI Key lỗi (${res.status})`);
            } else {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
                showToast(res.ok ? '✓ Google API Key hợp lệ!' : `✗ Google Key lỗi (${res.status})`);
            }
        } catch {
            showToast(`✗ Không thể kết nối ${provider === 'openai' ? 'OpenAI' : 'Google'}`);
        }
    };

    const activeCount = features.filter((f) => f.enabled).length;

    return (
        <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 8 }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>AI & Cấu hình</h1>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(212,168,83,0.1)', color: 'var(--gold-400)' }}>
                        {activeCount}/{features.length} đang bật
                    </span>
                    <button className="btn btn-primary btn-sm" onClick={saveConfig} disabled={saving} style={{ fontSize: 12, gap: 4, opacity: saving ? 0.6 : 1 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>
                Quản lý API Key, chọn Model và cấu hình từng tính năng AI
            </p>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 999,
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--gold-400)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    fontSize: 'var(--text-sm)', fontWeight: 600,
                    animation: 'fadeIn 200ms ease',
                }}>
                    {toast}
                </div>
            )}

            {/* ═══ AI Provider Config — API Keys ═══ */}
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--gradient-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0f' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                    </div>
                    <div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>API Keys</h3>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Dán API Key để kích hoạt các tính năng AI</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                    {/* OpenAI */}
                    <div style={{
                        padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: activeProvider === 'openai' ? '2px solid var(--gold-400)' : '2px solid var(--border-primary)',
                        cursor: 'pointer',
                    }} onClick={() => setActiveProvider('openai')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke={activeProvider === 'openai' ? 'var(--gold-400)' : 'var(--text-muted)'} strokeWidth="1.5" /><path d="M12 6v2m0 8v2m-6-6h2m8 0h2" stroke={activeProvider === 'openai' ? 'var(--gold-400)' : 'var(--text-muted)'} strokeWidth="1.5" /></svg>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>OpenAI</span>
                            {activeProvider === 'openai' && <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 700, marginLeft: 'auto' }}>Active</span>}
                        </div>
                        <label style={labelStyle}>API Key</label>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                            <input
                                className="input"
                                type={showKeyOpenai ? 'text' : 'password'}
                                placeholder="sk-..."
                                value={openaiKey}
                                onChange={e => setOpenaiKey(e.target.value)}
                                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                            />
                            <button className="btn btn-sm btn-ghost" onClick={() => setShowKeyOpenai(!showKeyOpenai)} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                {showKeyOpenai ? '🙈' : '👁'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                            <button className="btn btn-sm" onClick={() => testApiKey('openai')} style={{ flex: 1, fontSize: 11 }}>Test Key</button>
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Models: GPT-5.2, GPT-5, o3, GPT-4.1, GPT-4o</p>
                    </div>

                    {/* Google */}
                    <div style={{
                        padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-tertiary)',
                        border: activeProvider === 'google' ? '2px solid var(--gold-400)' : '2px solid var(--border-primary)',
                        cursor: 'pointer',
                    }} onClick={() => setActiveProvider('google')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="none" stroke={activeProvider === 'google' ? 'var(--gold-400)' : 'var(--text-muted)'} strokeWidth="1.5" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke={activeProvider === 'google' ? 'var(--gold-400)' : 'var(--text-muted)'} strokeWidth="1.5" /></svg>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>Google Gemini</span>
                            {activeProvider === 'google' && <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 99, background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)', fontWeight: 700, marginLeft: 'auto' }}>Active</span>}
                        </div>
                        <label style={labelStyle}>API Key</label>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                            <input
                                className="input"
                                type={showKeyGoogle ? 'text' : 'password'}
                                placeholder="AIza..."
                                value={googleKey}
                                onChange={e => setGoogleKey(e.target.value)}
                                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 12 }}
                            />
                            <button className="btn btn-sm btn-ghost" onClick={() => setShowKeyGoogle(!showKeyGoogle)} style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                {showKeyGoogle ? '🙈' : '👁'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                            <button className="btn btn-sm" onClick={() => testApiKey('google')} style={{ flex: 1, fontSize: 11 }}>Test Key</button>
                        </div>
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Models: Gemini 3.0 Pro, Gemini 3.0 Flash, Gemini 2.5 Pro</p>
                    </div>
                </div>
            </div>

            {/* ═══ Feature Cards with Config Forms ═══ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
                {features.map((f, i) => (
                    <div
                        key={f.name}
                        className="card"
                        style={{
                            padding: 'var(--space-4)',
                            opacity: f.enabled ? 1 : 0.55,
                            transition: 'opacity 300ms ease',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                                background: f.enabled ? 'var(--gradient-gold)' : 'var(--bg-tertiary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                color: f.enabled ? '#0a0a0f' : 'var(--text-muted)',
                                transition: 'background 300ms ease',
                            }}>
                                {f.iconSvg}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</h3>
                                    <ToggleSwitch enabled={f.enabled} onToggle={() => toggleFeature(i)} />
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1.4 }}>{f.desc}</p>
                            </div>
                        </div>

                        {/* Config Form — always visible */}
                        <div style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-tertiary)',
                            marginTop: 'var(--space-2)',
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                <div>
                                    <label style={labelStyle}>Provider</label>
                                    <select
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                        value={f.provider}
                                        onChange={e => {
                                            const p = e.target.value as 'openai' | 'google';
                                            updateFeature(i, 'provider', p);
                                            updateFeature(i, 'model', p === 'openai' ? 'gpt-4o-mini' : 'gemini-2.0-flash');
                                        }}
                                    >
                                        <option value="openai">OpenAI</option>
                                        <option value="google">Google Gemini</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Model</label>
                                    <select
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                        value={f.model}
                                        onChange={e => updateFeature(i, 'model', e.target.value)}
                                    >
                                        {(f.provider === 'openai' ? OPENAI_MODELS : GOOGLE_MODELS).map(m => (
                                            <option key={m.id} value={m.id} style={{ color: TIER_COLORS[m.tier] }}>
                                                {m.tier === 'flagship' ? '⭐ ' : m.tier === 'premium' ? '★ ' : ''}{m.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                                <div>
                                    <label style={labelStyle}>Temperature ({f.temperature})</label>
                                    <input
                                        type="range"
                                        min="0" max="2" step="0.1"
                                        value={f.temperature}
                                        onChange={e => updateFeature(i, 'temperature', parseFloat(e.target.value))}
                                        style={{ width: '100%', accentColor: 'var(--gold-400)' }}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Max Tokens</label>
                                    <select
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                        value={f.maxTokens}
                                        onChange={e => updateFeature(i, 'maxTokens', parseInt(e.target.value))}
                                    >
                                        <option value="256">256</option>
                                        <option value="512">512</option>
                                        <option value="1024">1,024</option>
                                        <option value="2048">2,048</option>
                                        <option value="4096">4,096</option>
                                        <option value="8192">8,192</option>
                                        <option value="16384">16,384</option>
                                        <option value="32768">32,768</option>
                                        <option value="65536">65,536</option>
                                        <option value="128000">128,000</option>
                                    </select>
                                </div>
                            </div>

                            {/* System Prompt */}
                            <div style={{ marginBottom: 8 }}>
                                <label style={labelStyle}>System Prompt</label>
                                <textarea
                                    value={f.systemPrompt}
                                    onChange={e => updateFeature(i, 'systemPrompt', e.target.value)}
                                    placeholder="Nhập system prompt cho tính năng này..."
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, minHeight: 60 }}
                                />
                            </div>

                            {/* Custom Instructions */}
                            <div>
                                <label style={labelStyle}>Custom Instructions (tuỳ chọn)</label>
                                <input
                                    type="text"
                                    value={f.customInstructions}
                                    onChange={e => updateFeature(i, 'customInstructions', e.target.value)}
                                    placeholder="VD: Luôn trả lời bằng tiếng Việt, không dùng emoji..."
                                    style={{ ...inputStyle, fontFamily: 'inherit' }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
                            <code style={{ color: 'var(--gold-400)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: 10 }}>{f.endpoint}</code>
                            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>{f.enabled ? f.usage : 'Đã tắt'}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Knowledge Base */}
            <div className="card" style={{ padding: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Knowledge Base</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                    Dữ liệu huấn luyện AI Stylist và Personalization
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
                    {[
                        { label: 'Sản phẩm', value: '8' },
                        { label: 'Face shapes', value: '5' },
                        { label: 'Frame shapes', value: '8' },
                        { label: 'Materials', value: '7' },
                        { label: 'Style tags', value: '12' },
                        { label: 'Intent patterns', value: '25+' },
                    ].map((d) => (
                        <div key={d.label} style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--gold-400)' }}>{d.value}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
