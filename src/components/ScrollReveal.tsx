'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const SELECTORS = [
    'scroll-reveal',
    'scroll-reveal-left',
    'scroll-reveal-right',
    'scroll-scale',
    'stagger-children',
];

/**
 * ScrollReveal — uses IntersectionObserver + MutationObserver
 * to animate elements that enter the viewport.
 *
 * MutationObserver catches dynamically injected RSC content
 * so elements are never left invisible after client-side navigation.
 */
export default function ScrollReveal() {
    const pathname = usePathname();
    const ioRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        document.documentElement.classList.add('js-scroll-ready');

        // IntersectionObserver — reveals elements when they enter viewport
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.05, rootMargin: '80px 0px 0px 0px' }
        );
        ioRef.current = io;

        const matchesSelector = (el: Element) =>
            SELECTORS.some((cls) => el.classList.contains(cls));

        const observeNew = (el: Element) => {
            if (!el.classList.contains('is-visible')) {
                io.observe(el);
            }
        };

        // Sweep all existing elements
        const sweep = () => {
            const all = document.querySelectorAll(SELECTORS.map(s => `.${s}`).join(','));
            all.forEach(observeNew);
        };

        // MutationObserver — catches dynamically added RSC content
        const mo = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node instanceof Element) {
                        if (matchesSelector(node)) observeNew(node);
                        // Also check children of added nodes
                        const children = node.querySelectorAll(SELECTORS.map(s => `.${s}`).join(','));
                        children.forEach(observeNew);
                    }
                }
            }
        });

        mo.observe(document.body, { childList: true, subtree: true });

        // Initial sweep + delayed sweep for safety
        sweep();
        requestAnimationFrame(sweep);
        setTimeout(sweep, 100);
        setTimeout(sweep, 500);

        return () => {
            io.disconnect();
            mo.disconnect();
            ioRef.current = null;
        };
    }, [pathname]);

    return null;
}
