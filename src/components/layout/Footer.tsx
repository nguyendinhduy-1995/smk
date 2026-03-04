import Link from 'next/link';

/* ═══ #7 — Real SVG social icons ═══ */
function FacebookIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}
function InstagramIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    );
}
function TikTokIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.43v-7.15a8.16 8.16 0 005.58 2.19v-3.45a4.85 4.85 0 01-4-4.53z" />
        </svg>
    );
}

export default function Footer() {
    return (
        <footer
            style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-secondary)',
                padding: 'var(--space-12) 0 var(--space-16)',
            }}
        >
            <div className="container">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 'var(--space-8)',
                    }}
                >
                    {/* Brand */}
                    <div>
                        <h3
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'var(--text-xl)',
                                fontWeight: 800,
                                background: 'var(--gradient-gold)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: 'var(--space-3)',
                            }}
                        >
                            Siêu Thị Mắt Kính ✦
                        </h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                            Kính mắt thời trang cao cấp. Gọng kính chính hãng, tròng kính chất lượng.
                            Tư vấn miễn phí, bảo hành tận tâm.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                            Mua sắm
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {[
                                { href: '/c/kinh-can', label: 'Kính cận' },
                                { href: '/c/kinh-ram', label: 'Kính râm' },
                                { href: '/c/kinh-thoi-trang', label: 'Kính thời trang' },
                                { href: '/c/gong-kinh', label: 'Gọng kính' },
                                { href: '/c/trong-kinh', label: 'Tròng kính' },
                                { href: '/c/phu-kien', label: 'Phụ kiện' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                            Hỗ trợ
                        </h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {[
                                { href: '/support', label: 'Trung tâm hỗ trợ' },
                                { href: '/faq', label: '❓ Câu hỏi thường gặp' },
                                { href: '/track', label: '📦 Tra cứu vận đơn' },
                                { href: '/support/doi-tra', label: 'Chính sách đổi trả' },
                                { href: '/support/bao-hanh', label: 'Bảo hành' },
                                { href: '/support/do-mat', label: 'Hướng dẫn đo mắt' },
                                { href: '/support/size-guide', label: 'Hướng dẫn chọn size' },
                                { href: '/partner', label: 'Đăng ký đại lý' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', textDecoration: 'none' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--text-primary)' }}>
                            Liên hệ
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            <a href="tel:0987350626" style={{ color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                                0987 350 626
                            </a>
                            <a href="mailto:info@sieuthimatkinh.vn" style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                info@sieuthimatkinh.vn
                            </a>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                Số 9, Đường số 3, Cityland, Gò Vấp, TP.HCM
                            </p>
                            {/* #7 — Real social SVG icons */}
                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                <a href="#" className="footer-social-icon" aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all var(--transition-base)' }}>
                                    <FacebookIcon />
                                </a>
                                <a href="#" className="footer-social-icon" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all var(--transition-base)' }}>
                                    <InstagramIcon />
                                </a>
                                <a href="#" className="footer-social-icon" aria-label="TikTok" style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', border: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', transition: 'all var(--transition-base)' }}>
                                    <TikTokIcon />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 'var(--space-8)',
                        paddingTop: 'var(--space-6)',
                        borderTop: '1px solid var(--border-secondary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 'var(--space-4)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-muted)',
                    }}
                >
                    <p>© 2026 Siêu Thị Mắt Kính. Tất cả quyền được bảo lưu.</p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Điều khoản</Link>
                        <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Bảo mật</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
