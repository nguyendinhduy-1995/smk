import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnalyticsProvider from '@/components/Analytics';
import FloatingZalo from '@/components/FloatingZalo';
import SocialProof from '@/components/SocialProof';
import RecentlyViewed from '@/components/RecentlyViewed';
import ScrollReveal from '@/components/ScrollReveal';
import BehaviorTracker from '@/components/BehaviorTracker';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <AnalyticsProvider />
            <BehaviorTracker />
            <ScrollReveal />
            <Header />
            <main className="page-content">
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
