'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal — adds IntersectionObserver to animate elements
 * with .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right,
 * .scroll-scale, .stagger-children classes.
 *
 * Elements are visible by default (for SSR/no-JS). Once JS mounts,
 * we add 'js-scroll-ready' to <html> which enables the hidden state,
 * then IntersectionObserver reveals them on scroll.
 */
export default function ScrollReveal() {
    useEffect(() => {
        // Mark JS as ready — CSS uses this to enable hidden state
        document.documentElement.classList.add('js-scroll-ready');

        const selectors = [
            '.scroll-reveal',
            '.scroll-reveal-left',
            '.scroll-reveal-right',
            '.scroll-scale',
            '.stagger-children',
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // once only
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px 0px 0px 0px' }
        );

        // Small delay to let above-fold content be visible immediately
        requestAnimationFrame(() => {
            const elements = document.querySelectorAll(selectors.join(','));
            elements.forEach((el) => observer.observe(el));
        });

        return () => observer.disconnect();
    }, []);

    return null;
}
