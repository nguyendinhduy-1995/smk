'use client';

import Link from 'next/link';
import { useCartStore, useCartHydrated } from '@/stores/cartStore';
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
    const hydrated = useCartHydrated();
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
                            {hydrated && totalItems > 0 && <span className="header__badge">{totalItems}</span>}
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
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* ── Header with gradient ── */}
                    <div style={{
                        padding: 'var(--space-5) var(--space-5)',
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(96,165,250,0.05))',
                        borderBottom: '1px solid rgba(212,168,83,0.15)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none' }}>
                            SMK ✦
                        </Link>
                        <button onClick={() => setMenuOpen(false)} style={{
                            background: 'var(--bg-tertiary)', border: 'none', color: 'var(--text-secondary)',
                            width: 36, height: 36, borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', fontSize: 16,
                        }}>✕</button>
                    </div>

                    {/* ── Main navigation ── */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-3)' }}>
                        {/* Category links with icons */}
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            Danh mục
                        </p>
                        {[
                            { href: '/', icon: '🏠', label: 'Trang chủ' },
                            { href: '/search?category=kinh-mat', icon: '👓', label: 'Kính mắt' },
                            { href: '/search?category=kinh-ram', icon: '🕶️', label: 'Kính râm' },
                            { href: '/search?category=gong-kinh', icon: '🔲', label: 'Gọng kính' },
                            { href: '/search?brand=ray-ban', icon: '✦', label: 'Ray-Ban' },
                            { href: '/search?brand=tom-ford', icon: '✦', label: 'Tom Ford' },
                            { href: '/search', icon: '🔍', label: 'Tất cả sản phẩm' },
                        ].map((item) => (
                            <Link
                                key={item.href + item.label}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)', fontWeight: 500,
                                    color: 'var(--text-primary)', textDecoration: 'none',
                                    transition: 'background 150ms',
                                    minHeight: 44,
                                }}
                            >
                                <span style={{ width: 28, textAlign: 'center', fontSize: 16 }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        <div style={{ height: 1, background: 'var(--border-secondary)', margin: 'var(--space-4) var(--space-3)' }} />

                        {/* Support links */}
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            Dịch vụ
                        </p>
                        {[
                            { href: '/try-on', icon: '🪞', label: 'Thử Kính Online' },
                            { href: '/support', icon: '💬', label: 'Tư Vấn Chọn Kính' },
                            { href: '/faq', icon: '❓', label: 'Câu hỏi thường gặp' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)', fontWeight: 500,
                                    color: 'var(--text-primary)', textDecoration: 'none',
                                    transition: 'background 150ms',
                                    minHeight: 44,
                                }}
                            >
                                <span style={{ width: 28, textAlign: 'center', fontSize: 16 }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}

                        <div style={{ height: 1, background: 'var(--border-secondary)', margin: 'var(--space-4) var(--space-3)' }} />

                        {/* Account links */}
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 var(--space-3)', marginBottom: 'var(--space-2)' }}>
                            Tài khoản
                        </p>
                        {[
                            { href: '/account', icon: '👤', label: 'Tài khoản' },
                            { href: '/orders', icon: '📦', label: 'Đơn hàng' },
                            { href: '/wishlist', icon: '❤️', label: 'Yêu thích' },
                            { href: '/track', icon: '🚚', label: 'Tra cứu vận đơn' },
                        ].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                    padding: 'var(--space-3) var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-sm)', fontWeight: 500,
                                    color: 'var(--text-primary)', textDecoration: 'none',
                                    transition: 'background 150ms',
                                    minHeight: 44,
                                }}
                            >
                                <span style={{ width: 28, textAlign: 'center', fontSize: 16 }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* ── Bottom CTA ── */}
                    <div style={{
                        padding: 'var(--space-4) var(--space-5)',
                        borderTop: '1px solid var(--border-secondary)',
                        background: 'var(--bg-secondary)',
                    }}>
                        <Link
                            href="/partner"
                            onClick={() => setMenuOpen(false)}
                            className="btn btn-primary"
                            style={{
                                width: '100%', textAlign: 'center', textDecoration: 'none',
                                minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            🤝 Trở thành Đại lý
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
}
