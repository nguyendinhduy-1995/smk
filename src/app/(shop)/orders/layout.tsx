import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Đơn hàng của tôi',
    description: 'Xem và quản lý đơn hàng của bạn tại Siêu Thị Mắt Kính',
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
    return children;
}
