'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    hasMore: boolean;
    loading: boolean;
    threshold?: number;
}

export function useInfiniteScroll({ onLoadMore, hasMore, loading, threshold = 200 }: UseInfiniteScrollOptions) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    const handleIntersection = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0]?.isIntersecting && hasMore && !loading) {
                onLoadMore();
            }
        },
        [onLoadMore, hasMore, loading]
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersection, {
            rootMargin: `0px 0px ${threshold}px 0px`,
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleIntersection, threshold]);

    return { sentinelRef };
}
