import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnalyticsProvider from '@/components/Analytics';
import FloatingZalo from '@/components/FloatingZalo';
import SocialProof from '@/components/SocialProof';
import FlashSaleBanner from '@/components/FlashSale';
import RecentlyViewed from '@/components/RecentlyViewed';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AnalyticsProvider />
            <Header />
            <main className="page-content">
                <FlashSaleBanner />
                <ErrorBoundary>
                    {children}
                </ErrorBoundary>
            </main>
            <Footer />
            <RecentlyViewed />
            <MobileNav />
            <FloatingZalo />
            <SocialProof />
        </>
    );
}
