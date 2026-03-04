'use client';

/**
 * ThemeToggle — Dark/Light mode switch with localStorage persistence
 */

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('smk-admin-theme') as 'dark' | 'light' | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('smk-admin-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    return (
        <button className="zen-theme-toggle" onClick={toggle} title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}>
            <span style={{ fontSize: 18, transition: 'transform 300ms ease', transform: theme === 'light' ? 'rotate(180deg)' : 'rotate(0)' }}>
                {theme === 'dark' ? '' : ''}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                {theme === 'dark' ? 'Tối' : 'Sáng'}
            </span>
        </button>
    );
}
