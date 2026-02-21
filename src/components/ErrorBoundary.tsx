'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '50vh', padding: 'var(--space-8)', textAlign: 'center',
                }}>
                    <span style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>⚠️</span>
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                        Có lỗi xảy ra
                    </h2>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-4)', maxWidth: 400 }}>
                        Trang này gặp sự cố. Vui lòng thử tải lại hoặc quay về trang chủ.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ hasError: false, error: null })}
                            style={{ minHeight: 44 }}
                        >
                            🔄 Thử lại
                        </button>
                        <Link href="/" className="btn btn-secondary" style={{ minHeight: 44, textDecoration: 'none' }}>
                            🏠 Trang chủ
                        </Link>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre style={{
                            marginTop: 'var(--space-6)', padding: 'var(--space-4)',
                            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)', color: 'var(--danger)',
                            textAlign: 'left', maxWidth: '100%', overflow: 'auto',
                        }}>
                            {this.state.error.message}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
