'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal — adds IntersectionObserver to animate elements
 * with .scroll-reveal, .scroll-reveal-left, .scroll-reveal-right,
 * .scroll-scale, .stagger-children classes.
 *
 * Place this component once in a layout and it will observe
 * all matching elements, adding .is-visible when they enter viewport.
 */
export default function ScrollReveal() {
    useEffect(() => {
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
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        const elements = document.querySelectorAll(selectors.join(','));
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return null;
}
