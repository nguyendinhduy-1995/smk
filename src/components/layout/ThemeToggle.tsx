'use client';

import React, { useEffect, useState, useCallback } from 'react';

type ThemeMode = 'auto' | 'light' | 'dark';

function getTimeBasedTheme(): 'light' | 'dark' {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'light' : 'dark';
}

function getEffectiveTheme(mode: ThemeMode): 'light' | 'dark' {
    return mode === 'auto' ? getTimeBasedTheme() : mode;
}

export default function ThemeToggle() {
    const [mode, setMode] = useState<ThemeMode>('auto');
    const [mounted, setMounted] = useState(false);

    const applyTheme = useCallback((m: ThemeMode) => {
        const effective = getEffectiveTheme(m);
        document.documentElement.setAttribute('data-theme', effective);
    }, []);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('smk-theme-mode') as ThemeMode | null;

        // Migration: old key 'smk-theme' → new 'smk-theme-mode'
        const legacy = localStorage.getItem('smk-theme') as 'dark' | 'light' | null;
        const initial = saved || (legacy ? legacy : 'auto');

        setMode(initial);
        applyTheme(initial);

        // Auto mode: update on time change (every minute)
        const interval = setInterval(() => {
            const current = localStorage.getItem('smk-theme-mode') as ThemeMode | null;
            if (current === 'auto' || !current) {
                applyTheme('auto');
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [applyTheme]);

    const cycle = () => {
        const order: ThemeMode[] = ['auto', 'light', 'dark'];
        const next = order[(order.indexOf(mode) + 1) % 3];
        setMode(next);
        applyTheme(next);
        localStorage.setItem('smk-theme-mode', next);
    };

    if (!mounted) return <div style={{ width: 36, height: 36 }} />;

    const effective = getEffectiveTheme(mode);

    const icons: Record<ThemeMode, { icon: React.ReactNode; label: string }> = {
        auto: {
            label: `🔄 Tự động (${effective === 'light' ? 'sáng' : 'tối'})`,
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" /><path d="M12 20v2" />
                    <path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" />
                    <path d="M2 12h2" /><path d="M20 12h2" />
                    <path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
                    {/* Auto indicator dot */}
                    <circle cx="19" cy="5" r="3" fill="var(--gold-400)" stroke="none" />
                </svg>
            ),
        },
        light: {
            label: '☀️ Chế độ sáng',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2" /><path d="M12 21v2" />
                    <path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" />
                    <path d="M1 12h2" /><path d="M21 12h2" />
                    <path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" />
                </svg>
            ),
        },
        dark: {
            label: '🌙 Chế độ tối',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
                </svg>
            ),
        },
    };

    return (
        <button
            className="theme-toggle"
            onClick={cycle}
            aria-label={icons[mode].label}
            title={icons[mode].label}
            style={{ position: 'relative' }}
        >
            {icons[mode].icon}
            {mode === 'auto' && (
                <span style={{
                    position: 'absolute', bottom: -2, right: -2,
                    fontSize: 8, fontWeight: 700, color: 'var(--gold-400)',
                    background: 'var(--bg-primary)', borderRadius: 99,
                    padding: '0 3px', lineHeight: '12px',
                }}>A</span>
            )}
        </button>
    );
}
