'use client';

import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const totalItems = useCartStore((s) => s.totalItems());

    return (
        <header className="header">
            <div className="header__inner">
                <Link href="/" className="header__logo">
                    SMK ✦
                </Link>

                <div className="header__search hide-mobile">
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
                    <Link href="/search" className="header__action-btn hide-desktop">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </Link>

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
    );
}
