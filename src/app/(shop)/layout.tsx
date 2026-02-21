import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Footer from '@/components/layout/Footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="page-content">
                {children}
            </main>
            <Footer />
            <MobileNav />
        </>
    );
}
