import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Câu hỏi thường gặp',
    description: 'Giải đáp mọi thắc mắc về mua kính mắt, bảo hành, đổi trả, chọn kính phù hợp khuôn mặt, và chính sách giao hàng.',
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return children;
}
