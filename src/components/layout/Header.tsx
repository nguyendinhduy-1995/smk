'use client';

import Link from 'next/link';
import { useCartStore, useCartHydrated } from '@/stores/cartStore';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import { getDynamicMenuItems } from '@/components/BehaviorTracker';

const DESKTOP_NAV = [
    { href: '/', label: 'Trang chủ' },
    { href: '/search', label: 'Sản phẩm' },
    { href: '/try-on', label: 'Thử kính' },
    { href: '/blog', label: 'Blog' },
    { href: '/support', label: 'Hỗ trợ' },
];

const MENU_SECTIONS = [
    {
        title: null,
        items: [
            { href: '/', icon: '🏠', label: 'Trang chủ' },
            { href: '/search', icon: '🔍', label: 'Tất cả sản phẩm' },
        ],
    },
    {
        title: 'Khám phá',
        items: [
            { href: '/try-on', icon: '🪞', label: 'Thử kính online' },
            { href: '/quiz', icon: '🎯', label: 'Quiz chọn kính' },
            { href: '/compare', icon: '⚖️', label: 'So sánh kính' },
            { href: '/blog', icon: '📝', label: 'Blog' },
        ],
    },
    {
        title: 'Hỗ trợ',
        items: [
            { href: '/support', icon: '💬', label: 'Tư vấn chọn kính' },
            { href: '/faq', icon: '❓', label: 'Câu hỏi thường gặp' },
            { href: '/track', icon: '📦', label: 'Tra cứu vận đơn' },
        ],
    },
    {
        title: 'Tài khoản',
        items: [
            { href: '/account', icon: '👤', label: 'Tài khoản' },
            { href: '/orders', icon: '🧾', label: 'Đơn hàng của tôi' },
            { href: '/wishlist', icon: '❤️', label: 'Yêu thích' },
        ],
    },
];

export default function Header() {
    const totalItems = useCartStore((s) => s.totalItems());
    const hydrated = useCartHydrated();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dynamicItems, setDynamicItems] = useState<{ href: string; icon: string; label: string }[]>([]);

    useEffect(() => {
        setDynamicItems(getDynamicMenuItems());
    }, []);

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
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 5, width: 20, transition: 'all 200ms' }}>
                            <span style={{ display: 'block', height: 1.5, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 200ms', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
                            <span style={{ display: 'block', height: 1.5, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 200ms', opacity: menuOpen ? 0 : 1 }} />
                            <span style={{ display: 'block', height: 1.5, background: 'var(--text-primary)', borderRadius: 2, transition: 'all 200ms', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
                        </span>
                    </button>

                    {/* Logo */}
                    <Link href="/" className="header__logo hide-mobile">✦ SMK</Link>

                    {/* Desktop nav */}
                    <nav className="header__nav hide-mobile">
                        {DESKTOP_NAV.map((item) => (
                            <Link key={item.href} href={item.href} className="header__nav-link">{item.label}</Link>
                        ))}
                    </nav>

                    {/* Search */}
                    <div className="header__search">
                        <div style={{ position: 'relative' }}>
                            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.35 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                            </svg>
                            <Link href="/search">
                                <input className="header__search-input" placeholder="Tìm kính, thương hiệu..." readOnly style={{ cursor: 'pointer' }} />
                            </Link>
                        </div>
                    </div>

                    <div className="header__actions">
                        <ThemeToggle />
                        <Link href="/wishlist" className="header__action-btn hide-mobile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </Link>
                        <Link href="/cart" className="header__action-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" x2="21" y1="6" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {hydrated && totalItems > 0 && <span className="header__badge">{totalItems}</span>}
                        </Link>
                        <Link href="/account" className="header__action-btn hide-mobile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile slide-out menu */}
            {menuOpen && <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />}
            <nav className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Header */}
                    <div style={{
                        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <Link href="/" onClick={() => setMenuOpen(false)} style={{
                            fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800,
                            background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent', textDecoration: 'none', letterSpacing: '0.02em',
                        }}>
                            ✦ Siêu Thị Mắt Kính
                        </Link>
                        <button onClick={() => setMenuOpen(false)} style={{
                            background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)',
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 14,
                        }}>✕</button>
                    </div>

                    {/* Navigation */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                        {MENU_SECTIONS.map((section, si) => (
                            <div key={si} style={{ marginBottom: 4 }}>
                                {section.title && (
                                    <div style={{
                                        fontSize: 9.5, fontWeight: 700,
                                        color: 'var(--text-muted)', opacity: 0.6,
                                        textTransform: 'uppercase', letterSpacing: '0.12em',
                                        padding: '10px 10px 4px',
                                    }}>
                                        {section.title}
                                    </div>
                                )}
                                {section.items.map((item) => (
                                    <Link key={item.href + item.label} href={item.href} onClick={() => setMenuOpen(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 10px', borderRadius: 8,
                                            fontSize: 14, fontWeight: 500,
                                            color: 'var(--text-primary)', textDecoration: 'none',
                                            transition: 'background 120ms', minHeight: 42,
                                        }}>
                                        <span style={{ width: 22, textAlign: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}

                        {/* Dynamic items based on behavior */}
                        {dynamicItems.length > 0 && (
                            <>
                                <div style={{ height: 1, background: 'var(--border-secondary)', margin: '8px 10px' }} />
                                <div style={{
                                    fontSize: 9.5, fontWeight: 700, color: '#a855f7',
                                    textTransform: 'uppercase', letterSpacing: '0.12em',
                                    padding: '10px 10px 4px', display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    ✨ Gợi ý cho bạn
                                </div>
                                {dynamicItems.map((item) => (
                                    <Link key={item.href + item.label} href={item.href} onClick={() => setMenuOpen(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            padding: '10px 10px', borderRadius: 8,
                                            fontSize: 14, fontWeight: 500,
                                            color: 'var(--text-primary)', textDecoration: 'none',
                                            transition: 'background 120ms', minHeight: 42,
                                        }}>
                                        <span style={{ width: 22, textAlign: 'center', fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Bottom */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Link href="/partner" onClick={() => setMenuOpen(false)} className="btn btn-primary"
                                style={{
                                    flex: 1, textAlign: 'center', textDecoration: 'none', minHeight: 42,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 600, borderRadius: 8,
                                }}>
                                🤝 Đại lý
                            </Link>
                            <a href="tel:0987350626" className="btn"
                                style={{
                                    textAlign: 'center', textDecoration: 'none', minHeight: 42,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 600, borderRadius: 8,
                                    background: 'rgba(255,255,255,0.06)', color: 'var(--gold-400)',
                                }}>
                                📞 Gọi ngay
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
