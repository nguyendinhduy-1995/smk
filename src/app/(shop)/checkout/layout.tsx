import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thanh toán',
    description: 'Hoàn tất đơn hàng kính mắt. Giao hàng miễn phí từ 500K, thanh toán COD hoặc chuyển khoản.',
    robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
