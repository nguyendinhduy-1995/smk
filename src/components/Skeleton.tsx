export function ProductCardSkeleton() {
    return (
        <div className="card skeleton-card" style={{ padding: 'var(--space-3)' }}>
            <div className="skeleton" style={{ width: '100%', aspectRatio: '1', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }} />
            <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 4, marginBottom: 'var(--space-2)' }} />
            <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 'var(--space-2)' }} />
            <div className="skeleton" style={{ width: '50%', height: 16, borderRadius: 4 }} />
        </div>
    );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="stat-card">
            <div className="skeleton" style={{ width: '60%', height: 12, borderRadius: 4, marginBottom: 'var(--space-2)' }} />
            <div className="skeleton" style={{ width: '80%', height: 24, borderRadius: 4 }} />
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div className="container" style={{ paddingTop: 'var(--space-6)' }}>
            <div className="skeleton" style={{ width: '50%', height: 28, borderRadius: 6, marginBottom: 'var(--space-4)' }} />
            <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4, marginBottom: 'var(--space-6)' }} />
            <ProductGridSkeleton count={6} />
        </div>
    );
}
