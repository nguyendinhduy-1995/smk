'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const SHOP_NAV = [
    { href: '/', label: 'Trang chủ' },
    { href: '/search?category=kinh-mat', label: 'Kính mắt' },
    { href: '/search?category=kinh-ram', label: 'Kính râm' },
    { href: '/search?category=gong-kinh', label: 'Gọng kính' },
    { href: '/search?brand=ray-ban', label: 'Ray-Ban' },
    { href: '/search?brand=tom-ford', label: 'Tom Ford' },
    { href: '/search', label: 'Tất cả' },
    { href: '/faq', label: 'FAQ' },
    { href: '/support', label: 'Liên hệ' },
];

export default function Header() {
    const totalItems = useCartStore((s) => s.totalItems());
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <header className="header">
                <div className="header__inner">
                    {/* Hamburger — mobile only */}
                    <button
                        className="header__hamburger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                    >
                        <span style={{
                            display: 'flex', flexDirection: 'column', gap: 5, width: 22,
                            transition: 'all 200ms',
                        }}>
                            <span style={{
                                display: 'block', height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 200ms',
                                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                            }} />
                            <span style={{
                                display: 'block', height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 200ms',
                                opacity: menuOpen ? 0 : 1,
                            }} />
                            <span style={{
                                display: 'block', height: 2, background: 'var(--text-primary)',
                                borderRadius: 2, transition: 'all 200ms',
                                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                            }} />
                        </span>
                    </button>

                    {/* Logo — hidden on mobile to make room for search */}
                    <Link href="/" className="header__logo hide-mobile">
                        SMK ✦
                    </Link>

                    {/* Desktop nav links */}
                    <nav className="header__nav hide-mobile">
                        {SHOP_NAV.slice(0, 7).map((item) => (
                            <Link key={item.href} href={item.href} className="header__nav-link">
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Search bar — always visible, expanded on mobile */}
                    <div className="header__search">
                        <div style={{ position: 'relative' }}>
                            <svg
                                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <Link href="/search">
                                <input
                                    className="header__search-input"
                                    placeholder="Tìm gọng kính, thương hiệu..."
                                    readOnly
                                    style={{ cursor: 'pointer' }}
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="header__actions">
                        <ThemeToggle />

                        <Link href="/wishlist" className="header__action-btn hide-mobile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </Link>

                        <Link href="/track" className="header__action-btn hide-mobile" title="Tra cứu vận đơn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="3" width="15" height="13" rx="2" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                        </Link>

                        <Link href="/cart" className="header__action-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" x2="21" y1="6" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {totalItems > 0 && <span className="header__badge">{totalItems}</span>}
                        </Link>

                        <Link href="/account" className="header__action-btn hide-mobile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile slide-out menu */}
            {menuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
            )}
            <nav className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 800, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
                            SMK ✦
                        </Link>
                        <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 24, cursor: 'pointer', padding: 8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    {SHOP_NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-base)', fontWeight: 500,
                                color: 'var(--text-primary)', textDecoration: 'none',
                                transition: 'all 150ms',
                                minHeight: 44,
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}

                    <div className="divider" style={{ margin: 'var(--space-4) 0' }} />

                    <Link href="/wishlist" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', minHeight: 44 }}>
                        ❤️ Yêu thích
                    </Link>
                    <Link href="/track" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', minHeight: 44 }}>
                        🚚 Tra cứu đơn hàng
                    </Link>
                    <Link href="/account" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', minHeight: 44 }}>
                        👤 Tài khoản
                    </Link>
                    <Link href="/partner/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', minHeight: 44 }}>
                        🤝 Đại lý / Affiliate
                    </Link>
                </div>
            </nav>
        </>
    );
}
