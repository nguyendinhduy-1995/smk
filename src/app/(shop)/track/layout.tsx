import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tra cứu đơn hàng',
    description: 'Tra cứu tình trạng đơn hàng và vận chuyển. Nhập mã đơn hàng để theo dõi.',
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
    return children;
}
