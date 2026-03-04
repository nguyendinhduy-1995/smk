import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Thử Kính Online',
    description: 'Upload ảnh khuôn mặt và thử gọng kính trực tuyến. Xem kính phù hợp với khuôn mặt bạn trước khi mua.',
};

export default function TryOnLayout({ children }: { children: React.ReactNode }) {
    return children;
}
