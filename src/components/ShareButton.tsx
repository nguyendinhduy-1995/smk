'use client';

import { useCallback, useState } from 'react';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
            } catch { /* user cancelled */ }
        } else {
            // Fallback: copy link
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [title, text, shareUrl]);

    return (
        <button
            onClick={handleShare}
            aria-label="Chia sẻ"
            style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 150ms', minHeight: 36,
            }}
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
            {copied ? '✅ Đã sao chép!' : 'Chia sẻ'}
        </button>
    );
}
