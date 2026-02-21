import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tìm kiếm kính mắt',
    description: 'Tìm gọng kính phù hợp theo thương hiệu, kiểu dáng, mức giá. Ray-Ban, Tom Ford, Oakley, Lindberg và nhiều hơn.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return children;
}
