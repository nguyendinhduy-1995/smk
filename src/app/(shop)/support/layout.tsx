import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tư Vấn Chọn Kính',
    description: 'Chat trực tiếp với chuyên viên tư vấn để tìm gọng kính phù hợp khuôn mặt và phong cách của bạn.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
    return children;
}
