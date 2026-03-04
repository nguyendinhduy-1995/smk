'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationCenter from './NotificationCenter';

interface SearchResult {
    type: 'product' | 'order' | 'customer' | 'partner';
    label: string;
    href: string;
    icon: string;
    sub?: string;
}

export default function AdminHeader() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        if (searchOpen && inputRef.current) inputRef.current.focus();
    }, [searchOpen]);

    // Load saved theme
    useEffect(() => {
        const saved = localStorage.getItem('smk-admin-theme') as 'dark' | 'light' | null;
        if (saved) {
            setTheme(saved);
            document.documentElement.setAttribute('data-theme', saved);
        }
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('smk-admin-theme', next);
        document.documentElement.setAttribute('data-theme', next);
    };

    // Simple client-side search (can be upgraded to API)
    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const q = query.toLowerCase();
        // Quick navigation shortcuts based on query
        const shortcuts: SearchResult[] = [
            { type: 'product', label: `Tìm sản phẩm "${query}"`, href: `/admin/products?q=${encodeURIComponent(query)}`, icon: '' },
            { type: 'order', label: `Tìm đơn hàng "${query}"`, href: `/admin/orders?q=${encodeURIComponent(query)}`, icon: '' },
            { type: 'customer', label: `Tìm khách hàng "${query}"`, href: `/admin/customers?q=${encodeURIComponent(query)}`, icon: '' },
            { type: 'partner', label: `Tìm đối tác "${query}"`, href: `/admin/partners?q=${encodeURIComponent(query)}`, icon: '' },
        ];
        setResults(shortcuts);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        router.push(result.href);
        setSearchOpen(false);
        setQuery('');
    };

    const SunIcon = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );

    const MoonIcon = (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );

    return (
        <header className="admin-header">
            <div className="admin-header__inner">
                <span className="admin-header__brand">SMK</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flex: 1 }}>
                    <button
                        className="admin-header__search-trigger"
                        onClick={() => setSearchOpen(true)}
                        style={{ flex: 1 }}
                    >
                        <span></span>
                        <span className="admin-header__search-placeholder">Tìm kiếm...</span>
                    </button>

                    {/* Theme toggle button */}
                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 200ms',
                        }}
                    >
                        {theme === 'dark' ? SunIcon : MoonIcon}
                    </button>

                    <NotificationCenter />
                </div>
            </div>

            {/* Search modal */}
            {searchOpen && (
                <>
                    <div className="admin-header__search-overlay" onClick={() => setSearchOpen(false)} />
                    <div className="admin-header__search-modal">
                        <div className="admin-header__search-input-wrap">
                            <span></span>
                            <input
                                ref={inputRef}
                                className="admin-header__search-input"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
                                onKeyDown={e => {
                                    if (e.key === 'Escape') setSearchOpen(false);
                                    if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
                                }}
                            />
                            <button className="admin-header__search-close" onClick={() => setSearchOpen(false)}>✕</button>
                        </div>
                        {results.length > 0 && (
                            <div className="admin-header__search-results">
                                {results.map((r, i) => (
                                    <button
                                        key={i}
                                        className="admin-header__search-result"
                                        onClick={() => handleSelect(r)}
                                    >
                                        <span>{r.icon}</span>
                                        <span>{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </header>
    );
}

