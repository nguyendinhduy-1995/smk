'use client';

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100dvh',
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-primary)',
            }}
        >
            <div style={{ fontSize: 64, marginBottom: '1.5rem' }}>📡</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', fontFamily: 'var(--font-heading)' }}>
                Không có kết nối mạng
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', maxWidth: 360, marginBottom: '1.5rem' }}>
                Bạn đang offline. Một số tính năng có thể không khả dụng. Hãy kiểm tra kết nối mạng và thử lại.
            </p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '0.75rem 2rem',
                    background: 'var(--gradient-gold)',
                    color: '#0a0a0f',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                }}
            >
                Thử lại
            </button>
        </div>
    );
}
