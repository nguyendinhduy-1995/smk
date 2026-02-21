'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { useState, useEffect } from 'react';

const navItems = [
    {
        href: '/',
        label: 'Trang chủ',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
        ),
    },
    {
        href: '/search',
        label: 'Tìm kiếm',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
            </svg>
        ),
    },
    {
        href: '/cart',
        label: 'Giỏ hàng',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" x2="21" y1="6" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
        showBadge: true,
    },
    {
        href: '/account',
        label: 'Tài khoản',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function MobileNav() {
    const pathname = usePathname();
    const totalItems = useCartStore((s) => s.totalItems());
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
                    >
                        <span className="mobile-nav__icon" style={{ position: 'relative' }}>
                            {item.icon}
                            {item.showBadge && mounted && totalItems > 0 && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -8,
                                        minWidth: 16,
                                        height: 16,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'var(--gold-400)',
                                        color: '#0a0a0f',
                                        fontSize: 9,
                                        fontWeight: 700,
                                        borderRadius: 999,
                                        padding: '0 3px',
                                    }}
                                >
                                    {totalItems}
                                </span>
                            )}
                        </span>
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
