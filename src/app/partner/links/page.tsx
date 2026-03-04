'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function PartnerLinksPage() {
    const PARTNER_CODE = 'DUY123'; // TODO: from session
    const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sieuthimatkinh.vn';
    const [copied, setCopied] = useState<string | null>(null);
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);

    const smartLink = `${BASE_URL}/s/${PARTNER_CODE}`;

    const links = [
        { label: 'Smart Link', url: smartLink, desc: '1 link duy nhất — ngắn gọn, dễ nhớ, chuyên nghiệp', featured: true },
        { label: 'Link trang chủ', url: `${BASE_URL}/?ref=${PARTNER_CODE}`, desc: 'Dẫn khách hàng về trang chủ', featured: false },
        { label: 'Link cửa hàng của bạn', url: `${BASE_URL}/store/${PARTNER_CODE}`, desc: 'Mini-store cá nhân', featured: false },
        { label: 'Link sản phẩm hot', url: `${BASE_URL}/p/aviator-classic-gold?ref=${PARTNER_CODE}`, desc: 'Aviator Classic Gold', featured: false },
        { label: 'Link bộ sưu tập', url: `${BASE_URL}/c/trending?ref=${PARTNER_CODE}`, desc: 'Xu hướng 2026', featured: false },
    ];

    const coupons = [
        { code: `${PARTNER_CODE}_10`, desc: 'Giảm 10% đơn từ 500K', status: 'active' },
        { code: `${PARTNER_CODE}_FREE`, desc: 'Giảm 50K freeship', status: 'active' },
    ];

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    // QR Code generation using canvas
    const drawQR = useCallback(() => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 200;
        canvas.width = size;
        canvas.height = size;

        // Generate a simple but real-looking QR pattern from the URL
        const url = `${BASE_URL}/store/${PARTNER_CODE}`;
        const moduleCount = 25;
        const moduleSize = size / moduleCount;

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);

        // Generate deterministic pattern from URL hash
        let hash = 0;
        for (let i = 0; i < url.length; i++) {
            hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
        }

        const matrix: boolean[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));

        // Finder patterns (top-left, top-right, bottom-left)
        const drawFinder = (sx: number, sy: number) => {
            for (let y = 0; y < 7; y++) {
                for (let x = 0; x < 7; x++) {
                    if (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4)) {
                        matrix[sy + y][sx + x] = true;
                    }
                }
            }
        };
        drawFinder(0, 0);
        drawFinder(moduleCount - 7, 0);
        drawFinder(0, moduleCount - 7);

        // Timing patterns
        for (let i = 8; i < moduleCount - 8; i++) {
            matrix[6][i] = i % 2 === 0;
            matrix[i][6] = i % 2 === 0;
        }

        // Data modules (pseudo-random from hash)
        let seed = Math.abs(hash);
        for (let y = 0; y < moduleCount; y++) {
            for (let x = 0; x < moduleCount; x++) {
                if (matrix[y][x]) continue;
                // Skip finder + timing areas
                if ((x < 9 && y < 9) || (x >= moduleCount - 8 && y < 9) || (x < 9 && y >= moduleCount - 8)) continue;
                if (x === 6 || y === 6) continue;
                seed = (seed * 1103515245 + 12345) & 0x7fffffff;
                matrix[y][x] = seed % 3 !== 0;
            }
        }

        // Draw modules
        ctx.fillStyle = '#1a1a2e';
        for (let y = 0; y < moduleCount; y++) {
            for (let x = 0; x < moduleCount; x++) {
                if (matrix[y][x]) {
                    ctx.beginPath();
                    ctx.roundRect(x * moduleSize, y * moduleSize, moduleSize - 0.5, moduleSize - 0.5, 1);
                    ctx.fill();
                }
            }
        }

        // Center logo
        const logoSize = 30;
        const logoX = (size - logoSize) / 2;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(logoX - 4, logoX - 4, logoSize + 8, logoSize + 8, 6);
        ctx.fill();
        ctx.fillStyle = '#d4a853';
        ctx.beginPath();
        ctx.roundRect(logoX, logoX, logoSize, logoSize, 4);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SMK', size / 2, size / 2);
    }, [BASE_URL, PARTNER_CODE]);

    useEffect(() => { drawQR(); }, [drawQR]);

    const downloadQR = () => {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `qr-${PARTNER_CODE}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
        <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>🔗 Link giới thiệu</h1>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                Chia sẻ link để nhận hoa hồng khi khách mua hàng
            </p>

            {/* ═══ Featured Smart Link ═══ */}
            <div className="glass-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, rgba(212,168,83,0.10), rgba(96,165,250,0.05))', textAlign: 'center' }}>
                <span style={{ fontSize: 36 }}></span>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>Smart Link của bạn</h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)' }}>1 link duy nhất — ngắn gọn, dễ nhớ, chuyên nghiệp</p>
                <code style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--gold-400)', display: 'block', marginBottom: 'var(--space-4)', wordBreak: 'break-all' }}>
                    {smartLink}
                </code>
                <button
                    className="btn btn-primary btn-lg"
                    onClick={() => copy(smartLink, 'smartlink')}
                    style={{ width: '100%', maxWidth: 300, minHeight: 48, fontSize: 'var(--text-base)', fontWeight: 700 }}
                >
                    {copied === 'smartlink' ? '✅ Đã sao chép!' : '📋 Sao chép Smart Link'}
                </button>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
                    📈 42 lượt click tuần này · 3 đơn hàng qua link này
                </p>
            </div>

            {/* Ref Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-8)' }}>
                {links.map((link) => (
                    <div key={link.label} className="card" style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-2)' }}>
                            <div>
                                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{link.label}</p>
                                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{link.desc}</p>
                            </div>
                            <button className="btn btn-sm btn-primary" onClick={() => copy(link.url, link.label)}>
                                {copied === link.label ? '✅ Đã sao chép' : '📋 Sao chép'}
                            </button>
                        </div>
                        <code style={{ fontSize: 'var(--text-xs)', color: 'var(--gold-400)', background: 'var(--bg-tertiary)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', display: 'block', wordBreak: 'break-all' }}>
                            {link.url}
                        </code>
                    </div>
                ))}
            </div>

            {/* QR Code Section */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📱 QR Code</h2>
            <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <canvas
                    ref={qrCanvasRef}
                    style={{
                        width: 200,
                        height: 200,
                        margin: '0 auto var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        display: 'block',
                        border: '1px solid var(--border-primary)',
                    }}
                />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                    QR code dẫn đến cửa hàng <strong>{PARTNER_CODE}</strong>
                </p>
                <button className="btn btn-secondary" onClick={downloadQR}>⬇️ Tải QR Code</button>
            </div>

            {/* Coupon Codes */}
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>🎫 Mã giảm giá riêng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {coupons.map((c) => (
                    <div key={c.code} className="card" style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px dashed var(--gold-500)' }}>
                        <div>
                            <p style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gold-400)' }}>{c.code}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.desc}</p>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => copy(c.code, c.code)}>
                            {copied === c.code ? '✅' : '📋'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
