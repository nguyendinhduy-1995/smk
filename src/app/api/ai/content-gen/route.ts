import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { chatCompletion } from '@/lib/ai/openai';

const SYSTEM_PROMPTS: Record<string, string> = {
    caption: `Bạn là copywriter chuyên viết caption bán kính mắt trên mạng xã hội Việt Nam.
Viết caption hấp dẫn, có emoji, có hashtag. Phải bao gồm: hook, thông tin sản phẩm, giá, CTA.
Giọng văn tự nhiên, gần gũi người Việt. Tối đa 300 từ.`,

    video_script: `Bạn là đạo diễn content, viết kịch bản video review/quảng cáo kính mắt cho TikTok/Reels.
Chia thành các SCENE rõ ràng (Hook, Unboxing, Đeo thử, CTA).
Mỗi scene có: [Hành động], Script nói, Thời gian. Tổng 30-60 giây.
Thêm tips quay phim ở cuối.`,

    review: `Bạn là reviewer kính mắt chuyên nghiệp, viết review chân thực và chi tiết.
Bao gồm: Rating, Tiêu đề, Ưu điểm, Nhược điểm, Kết luận.
Giọng văn khách quan, có cảm xúc cá nhân. Tối đa 250 từ.`,

    story: `Bạn là social media manager, tạo template 4 slide Instagram/Facebook Story bán kính mắt.
Mỗi slide có: [Mô tả hình ảnh], Text, Sticker/Poll gợi ý.
Slide 1: Hook, Slide 2: Chi tiết, Slide 3: Đeo thử, Slide 4: CTA.`,
};

// POST /api/ai/content-gen — generate partner content with real OpenAI
export async function POST(req: NextRequest) {
    const { type, productSlug, tone = 'casual', platform = 'facebook' } = await req.json();

    if (!type || !productSlug) {
        return NextResponse.json({ error: 'type and productSlug required' }, { status: 400 });
    }

    if (!SYSTEM_PROMPTS[type]) {
        return NextResponse.json({ error: 'Invalid type (caption, video_script, review, story)' }, { status: 400 });
    }

    const product = await db.product.findUnique({
        where: { slug: productSlug },
        include: { variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 } },
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const price = product.variants[0]?.price || 0;
    const compareAt = product.variants[0]?.compareAtPrice;
    const discount = compareAt ? Math.round((1 - price / compareAt) * 100) : 0;
    const priceStr = new Intl.NumberFormat('vi-VN').format(price) + '₫';

    const productInfo = `
Sản phẩm: ${product.name}
Thương hiệu: ${product.brand || 'N/A'}
Chất liệu: ${product.material || 'Cao cấp'}
Kiểu gọng: ${product.frameShape || 'N/A'}
Giá: ${priceStr}${discount > 0 ? ` (Giảm ${discount}% từ ${new Intl.NumberFormat('vi-VN').format(compareAt!)}₫)` : ''}
Mô tả: ${product.description || 'Kính mắt thời trang cao cấp'}
Platform: ${platform}
Tone: ${tone}
Shop: Siêu Thị Mắt Kính (SMK)
Chính sách: Free ship đơn 500K+, đổi trả 30 ngày, bảo hành 12 tháng
`;

    let content: string;
    try {
        content = await chatCompletion(SYSTEM_PROMPTS[type], productInfo, {
            temperature: 0.9,
            maxTokens: 800,
        });
    } catch {
        // Fallback
        content = `✨ ${product.name} — ${product.brand}\n\n📌 Giá: ${priceStr}${discount > 0 ? ` (Giảm ${discount}%)` : ''}\n🚚 Free ship\n🔄 Đổi trả 30 ngày\n\n👉 Inbox để đặt hàng!`;
    }

    return NextResponse.json({
        content,
        productName: product.name,
        brand: product.brand,
        type,
        generatedAt: new Date().toISOString(),
    });
}
