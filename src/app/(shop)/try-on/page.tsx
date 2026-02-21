'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

const DEMO_FRAMES = [
    { id: 'aviator', name: 'Aviator Classic', slug: 'aviator-classic-gold', brand: 'Ray-Ban', price: 2990000, shape: 'Aviator' },
    { id: 'cat-eye', name: 'Cat-Eye Acetate', slug: 'cat-eye-acetate-tortoise', brand: 'Tom Ford', price: 4590000, shape: 'Cat-Eye' },
    { id: 'round', name: 'Round Titanium', slug: 'round-titanium-silver', brand: 'Lindberg', price: 8990000, shape: 'Round' },
    { id: 'square', name: 'Square TR90', slug: 'square-tr90-black', brand: 'Oakley', price: 3290000, shape: 'Square' },
    { id: 'browline', name: 'Browline Mixed', slug: 'browline-mixed-gold-black', brand: 'Persol', price: 5490000, shape: 'Browline' },
    { id: 'geometric', name: 'Geometric Rose', slug: 'geometric-titanium-rose', brand: 'Miu Miu', price: 7290000, shape: 'Geometric' },
];

const FACE_SHAPES = [
    { shape: 'Tròn', emoji: '🔴', recommended: ['Square', 'Rectangle', 'Browline'] },
    { shape: 'Dài', emoji: '📏', recommended: ['Aviator', 'Cat-Eye', 'Round'] },
    { shape: 'Vuông', emoji: '⬜', recommended: ['Round', 'Oval', 'Aviator'] },
    { shape: 'Oval', emoji: '🥚', recommended: ['Aviator', 'Square', 'Cat-Eye', 'Browline'] },
    { shape: 'Trái tim', emoji: '💛', recommended: ['Aviator', 'Cat-Eye', 'Browline'] },
];

export default function TryOnPage() {
    const [cameraActive, setCameraActive] = useState(false);
    const [selectedFrame, setSelectedFrame] = useState(DEMO_FRAMES[0]);
    const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
    const [detectedFace, setDetectedFace] = useState<string | null>(null);
    const [showFaceGuide, setShowFaceGuide] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch {
            alert('Không thể truy cập camera. Vui lòng cho phép sử dụng camera.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((t) => t.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
        }
    }, []);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setUploadedPhoto(reader.result as string);
            stopCamera();
            // Simulate face shape detection
            const shapes = ['Tròn', 'Dài', 'Vuông', 'Oval', 'Trái tim'];
            setDetectedFace(shapes[Math.floor(Math.random() * shapes.length)]);
        };
        reader.readAsDataURL(file);
    };

    const faceMatch = detectedFace ? FACE_SHAPES.find((f) => f.shape === detectedFace) : null;
    const recommendedFrames = faceMatch
        ? DEMO_FRAMES.filter((f) => faceMatch.recommended.includes(f.shape))
        : DEMO_FRAMES;

    return (
        <div className="container animate-in" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                🪞 Thử Kính Ảo (AR)
            </h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Thử kính trực tiếp với camera hoặc upload ảnh khuôn mặt
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--space-6)' }}>
                {/* Camera / Photo area */}
                <div>
                    <div
                        className="card"
                        style={{
                            position: 'relative',
                            aspectRatio: '4/3',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--bg-secondary)',
                        }}
                    >
                        {cameraActive ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                />
                                {/* Frame overlay */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '25%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: 100,
                                        opacity: 0.7,
                                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    👓
                                </div>
                                <div style={{ position: 'absolute', bottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                    <button className="btn btn-primary" onClick={stopCamera}>⏹️ Dừng camera</button>
                                </div>
                            </>
                        ) : uploadedPhoto ? (
                            <>
                                <img src={uploadedPhoto} alt="Uploaded face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {/* Frame overlay */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '22%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        fontSize: 120,
                                        opacity: 0.75,
                                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                                        pointerEvents: 'none',
                                    }}
                                >
                                    👓
                                </div>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => { setUploadedPhoto(null); setDetectedFace(null); }}
                                    style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                                <div style={{ fontSize: 64, marginBottom: 'var(--space-4)', opacity: 0.3 }}>📷</div>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>
                                    Bật camera hoặc upload ảnh để thử kính
                                </p>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                                    <button className="btn btn-primary" onClick={startCamera}>
                                        📷 Bật camera
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
                                        📁 Upload ảnh
                                    </button>
                                </div>
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

                    {/* Face detection result */}
                    {detectedFace && (
                        <div className="glass-card" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div style={{ fontSize: 32 }}>{faceMatch?.emoji}</div>
                            <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                                    Khuôn mặt: <span style={{ color: 'var(--gold-400)' }}>Mặt {detectedFace}</span>
                                </p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                    Gợi ý: {faceMatch?.recommended.join(', ')}
                                </p>
                            </div>
                            <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => setShowFaceGuide(!showFaceGuide)}
                                style={{ marginLeft: 'auto' }}
                            >
                                {showFaceGuide ? 'Ẩn' : 'Xem hướng dẫn'} 📖
                            </button>
                        </div>
                    )}

                    {showFaceGuide && (
                        <div className="card" style={{ marginTop: 'var(--space-3)', padding: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                                Hướng dẫn chọn kính theo khuôn mặt
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-2)' }}>
                                {FACE_SHAPES.map((f) => (
                                    <div
                                        key={f.shape}
                                        style={{
                                            padding: 'var(--space-3)',
                                            borderRadius: 'var(--radius-md)',
                                            background: detectedFace === f.shape ? 'rgba(212,168,83,0.1)' : 'var(--bg-tertiary)',
                                            border: detectedFace === f.shape ? '1px solid var(--gold-500)' : '1px solid transparent',
                                        }}
                                    >
                                        <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{f.emoji} Mặt {f.shape}</p>
                                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                                            Hợp: {f.recommended.join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Frame selector */}
                <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                        {detectedFace ? '✨ Gợi ý cho bạn' : 'Chọn gọng kính'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {recommendedFrames.map((frame) => (
                            <button
                                key={frame.id}
                                className="card"
                                onClick={() => setSelectedFrame(frame)}
                                style={{
                                    padding: 'var(--space-3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    cursor: 'pointer',
                                    border: selectedFrame.id === frame.id
                                        ? '1px solid var(--gold-400)'
                                        : '1px solid var(--border-secondary)',
                                    background: selectedFrame.id === frame.id
                                        ? 'rgba(212,168,83,0.06)'
                                        : 'var(--bg-card)',
                                    textAlign: 'left',
                                }}
                            >
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-tertiary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 24,
                                        flexShrink: 0,
                                    }}
                                >
                                    👓
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)' }}>{frame.brand}</p>
                                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{frame.name}</p>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{frame.shape}</p>
                                </div>
                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gold-400)', whiteSpace: 'nowrap' }}>
                                    {formatVND(frame.price)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {selectedFrame && (
                        <Link
                            href={`/p/${selectedFrame.slug}`}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginTop: 'var(--space-4)', textAlign: 'center' }}
                        >
                            Xem chi tiết {selectedFrame.name} →
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
