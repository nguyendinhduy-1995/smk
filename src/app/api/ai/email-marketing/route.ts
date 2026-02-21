import { NextResponse, NextRequest } from 'next/server';
import { chatCompletion } from '@/lib/ai/openai';

export async function POST(req: NextRequest) {
    try {
        const { segment, purpose, products, tone } = await req.json();

        let emailContent: { subject: string; body: string; cta: string };

        try {
            const result = await chatCompletion(
                'Bạn là chuyên gia email marketing cho cửa hàng kính mắt Việt Nam. Viết email bằng tiếng Việt.',
                `Viết email marketing:\n- Đối tượng: ${segment}\n- Mục đích: ${purpose}\n- Sản phẩm: ${products?.join(', ') || 'tất cả'}\n- Tone: ${tone || 'thân thiện'}\n\nTrả về JSON: {"subject": "...", "body": "nội dung HTML ngắn gọn", "cta": "text nút CTA"}`,
                { temperature: 0.7, maxTokens: 500 }
            );
            emailContent = JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
        } catch {
            const templates: Record<string, { subject: string; body: string; cta: string }> = {
                promotion: {
                    subject: '🔥 Flash Sale Kính Mắt - Giảm đến 50%!',
                    body: '<h2>Ưu đãi đặc biệt dành riêng cho bạn!</h2><p>Giảm đến 50% toàn bộ gọng kính thời trang. Bảo hành 12 tháng, freeship từ 500K.</p><p style="color:#d4a853;font-weight:bold">⏰ Chỉ trong 48 giờ!</p>',
                    cta: 'Mua ngay →',
                },
                welcome: {
                    subject: '👓 Chào mừng bạn đến với Siêu Thị Mắt Kính!',
                    body: '<h2>Cảm ơn bạn đã đăng ký!</h2><p>Tặng bạn mã giảm giá 10% cho đơn đầu tiên: <strong>WELCOME10</strong></p><p>Khám phá 200+ gọng kính chính hãng, AI tư vấn miễn phí!</p>',
                    cta: 'Khám phá ngay',
                },
                reactivation: {
                    subject: '💛 Chúng tôi nhớ bạn - Ưu đãi đặc biệt!',
                    body: '<h2>Đã lâu không gặp!</h2><p>Quay lại với mã giảm 15%: <strong>MISSYOU15</strong>. Nhiều mẫu mới đang chờ bạn!</p>',
                    cta: 'Xem mẫu mới',
                },
            };
            emailContent = templates[purpose] || templates.promotion;
        }

        return NextResponse.json(emailContent);
    } catch {
        return NextResponse.json({ error: 'Lỗi tạo email' }, { status: 500 });
    }
}
