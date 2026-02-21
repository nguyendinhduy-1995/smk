'use client';

import { useState } from 'react';

const FACE_SHAPES = [
    { id: 'oval', name: 'Oval', icon: '🥚', desc: 'Cân đối, trán rộng hơn hàm', recs: ['Mọi kiểu gọng đều phù hợp', 'Thử Aviator, Wayfarer, Cat-Eye'] },
    { id: 'round', name: 'Tròn', icon: '🔴', desc: 'Chiều rộng ≈ chiều dài, gò má đầy', recs: ['Gọng vuông, angular', 'Tránh gọng tròn, mảnh', 'Nên chọn gọng lớn hơn mặt'] },
    { id: 'square', name: 'Vuông', icon: '🟧', desc: 'Hàm rộng, góc cạnh rõ', recs: ['Gọng tròn, oval làm mềm', 'Rimless hoặc semi-rimless', 'Tránh gọng vuông, angular'] },
    { id: 'heart', name: 'Tim', icon: '💜', desc: 'Trán rộng, cằm nhọn', recs: ['Gọng nhẹ, mảnh', 'Aviator, pilot', 'Rimless, bottom-heavy frames'] },
    { id: 'long', name: 'Dài', icon: '📏', desc: 'Chiều dài > chiều rộng rõ rệt', recs: ['Gọng to, oversized', 'Wayfarer, butterfly', 'Tránh gọng nhỏ, hẹp'] },
];

const SIZES = [
    { label: 'XS', width: '< 125mm', bridge: '14-16mm', temple: '130-135mm', desc: 'Khuôn mặt nhỏ' },
    { label: 'S', width: '125-130mm', bridge: '16-18mm', temple: '135-140mm', desc: 'Khuôn mặt nhỏ-TB' },
    { label: 'M', width: '130-138mm', bridge: '18-20mm', temple: '140-145mm', desc: 'Khuôn mặt trung bình' },
    { label: 'L', width: '138-145mm', bridge: '20-22mm', temple: '145-150mm', desc: 'Khuôn mặt lớn' },
    { label: 'XL', width: '> 145mm', bridge: '22-24mm', temple: '150-155mm', desc: 'Khuôn mặt rất lớn' },
];

export default function SmartSizeGuidePage() {
    const [faceWidth, setFaceWidth] = useState('');
    const [selectedShape, setSelectedShape] = useState<string | null>(null);
    const [result, setResult] = useState<{ size: typeof SIZES[0]; shape: typeof FACE_SHAPES[0] } | null>(null);

    const calculate = () => {
        const width = parseFloat(faceWidth);
        if (isNaN(width) || width < 100 || width > 180) return;
        const size = width < 125 ? SIZES[0] : width < 130 ? SIZES[1] : width < 138 ? SIZES[2] : width < 145 ? SIZES[3] : SIZES[4];
        const shape = FACE_SHAPES.find(s => s.id === selectedShape) || FACE_SHAPES[0];
        setResult({ size, shape });
    };

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-4)', paddingBottom: 'var(--space-8)', maxWidth: 700 }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 4 }}>📐 Tìm Size Kính Phù Hợp</h1>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)' }}>
                Nhập số đo khuôn mặt để AI gợi ý size gọng kính chính xác
            </p>

            {/* Step 1: Face shape */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>1️⃣ Chọn hình dạng khuôn mặt</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                    {FACE_SHAPES.map(shape => (
                        <button key={shape.id} onClick={() => setSelectedShape(shape.id)}
                            className="card" style={{
                                padding: 10, textAlign: 'center', cursor: 'pointer',
                                border: selectedShape === shape.id ? '2px solid var(--gold-400)' : '2px solid transparent',
                                background: selectedShape === shape.id ? 'rgba(212,168,83,0.08)' : 'var(--bg-tertiary)',
                            }}>
                            <span style={{ fontSize: 24 }}>{shape.icon}</span>
                            <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{shape.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Face width */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>2️⃣ Nhập chiều rộng khuôn mặt (mm)</h3>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Đo từ thái dương trái đến thái dương phải. TB người lớn: 130-140mm.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" value={faceWidth} onChange={e => setFaceWidth(e.target.value)}
                        placeholder="VD: 135" min={100} max={180}
                        style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', fontSize: 16 }} />
                    <button className="btn btn-primary" onClick={calculate} disabled={!selectedShape || !faceWidth}>
                        🤖 Tính size
                    </button>
                </div>
            </div>

            {/* Result */}
            {result && (
                <div className="glass-card" style={{ padding: 'var(--space-5)', background: 'linear-gradient(135deg, rgba(212,168,83,0.08), rgba(168,85,247,0.04))' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        🤖 Kết quả AI
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>Smart Fit</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 'var(--space-3)' }}>
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold-400)' }}>{result.size.label}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Size gọng</div>
                        </div>
                        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: 28 }}>{result.shape.icon}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Mặt {result.shape.name}</div>
                        </div>
                    </div>

                    <div style={{ padding: 10, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 12, marginBottom: 10 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
                            <div><span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Rộng gọng</span><br /><strong>{result.size.width}</strong></div>
                            <div><span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Bridge</span><br /><strong>{result.size.bridge}</strong></div>
                            <div><span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Temple</span><br /><strong>{result.size.temple}</strong></div>
                        </div>
                    </div>

                    <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                        <strong>🎯 Gợi ý kiểu gọng:</strong>
                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {result.shape.recs.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            {/* Size reference table */}
            <div className="card" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-4)', overflowX: 'auto' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📏 Bảng tham chiếu size</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                            {['Size', 'Rộng gọng', 'Bridge', 'Temple', 'Phù hợp'].map(h => <th key={h} style={{ padding: 8, textAlign: 'left', fontSize: 11, color: 'var(--text-muted)' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SIZES.map(s => (
                            <tr key={s.label} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                <td style={{ padding: 8, fontWeight: 700, color: 'var(--gold-400)' }}>{s.label}</td>
                                <td style={{ padding: 8 }}>{s.width}</td>
                                <td style={{ padding: 8 }}>{s.bridge}</td>
                                <td style={{ padding: 8 }}>{s.temple}</td>
                                <td style={{ padding: 8, color: 'var(--text-muted)' }}>{s.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
