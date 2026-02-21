import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnalyticsProvider from '@/components/Analytics';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AnalyticsProvider />
            <Header />
            <main className="page-content">
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>
            <Footer />
            <MobileNav />
        </>
    );
}
