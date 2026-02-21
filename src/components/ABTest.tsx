'use client';

import { useState } from 'react';

interface ABTestProps {
    testId: string;
    variants: { id: string; component: React.ReactNode }[];
}

// Simple client-side A/B test using localStorage
export function useABTest(testId: string, variants: string[]): string {
    if (typeof window === 'undefined') return variants[0];
    const key = `smk_ab_${testId}`;
    let assigned = localStorage.getItem(key);
    if (!assigned || !variants.includes(assigned)) {
        assigned = variants[Math.floor(Math.random() * variants.length)];
        localStorage.setItem(key, assigned);
    }
    return assigned;
}

// Track A/B test conversion
export function trackABConversion(testId: string, event: string) {
    if (typeof window === 'undefined') return;
    const variant = localStorage.getItem(`smk_ab_${testId}`);
    if (!variant) return;

    // Store conversion locally
    const key = `smk_ab_conversions`;
    try {
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : {};
        const testKey = `${testId}:${variant}:${event}`;
        data[testKey] = (data[testKey] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* silently fail */ }
}

// Admin component to view A/B test results
export default function ABTestAdmin() {
    const [results, setResults] = useState<Record<string, number>>({});

    const loadResults = () => {
        try {
            const raw = localStorage.getItem('smk_ab_conversions');
            setResults(raw ? JSON.parse(raw) : {});
        } catch { setResults({}); }
    };

    return (
        <div className="card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>🧪 A/B Test</h3>
                <button className="btn btn-sm" onClick={loadResults}>Tải kết quả</button>
            </div>
            {Object.keys(results).length === 0 ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Chưa có dữ liệu. Bấm "Tải kết quả" để xem.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {Object.entries(results).map(([key, count]) => {
                        const [testId, variant, event] = key.split(':');
                        return (
                            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: 'var(--space-2)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                <span>{testId} → <strong>{variant}</strong> ({event})</span>
                                <span style={{ fontWeight: 700, color: 'var(--gold-400)' }}>{count}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
