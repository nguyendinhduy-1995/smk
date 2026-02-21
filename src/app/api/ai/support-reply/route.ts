import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai/openai';

export async function POST(req: NextRequest) {
    const { subject, message, channel } = await req.json();

    if (!subject && !message) {
        return NextResponse.json({ error: 'subject or message required' }, { status: 400 });
    }

    const prompt = `Khách hàng cửa hàng kính mắt gửi ticket hỗ trợ:
Kênh: ${channel || 'chat'}
Tiêu đề: ${subject || 'Không có'}
Nội dung: ${message || subject}

Chính sách shop:
- Free ship đơn từ 500K
- Đổi trả 30 ngày (nguyên tem, hộp)
- Bảo hành gọng 12 tháng, tròng 6 tháng
- Hoàn tiền 5-7 ngày làm việc qua chuyển khoản
- Thời gian giao 2-4 ngày (nội thành HCM 1-2 ngày)

Trả về JSON:
{
  "intent": "tracking" | "return" | "warranty" | "complaint" | "inquiry" | "other",
  "suggestedReply": "Câu trả lời gợi ý, lịch sự, chuyên nghiệp",
  "priority": "low" | "medium" | "high",
  "confidence": 0.0-1.0
}`;

    try {
        const result = await chatCompletion(
            'Bạn là nhân viên CSKH cửa hàng kính mắt Siêu Thị Mắt Kính. Trả lời lịch sự, chuyên nghiệp, ngắn gọn. Trả về JSON thuần.',
            prompt,
            { temperature: 0.4, maxTokens: 400 }
        );

        const parsed = JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
        return NextResponse.json(parsed);
    } catch {
        return NextResponse.json({
            intent: 'inquiry',
            suggestedReply: `Chào bạn! Cảm ơn bạn đã liên hệ Siêu Thị Mắt Kính. Về vấn đề "${subject || message?.slice(0, 50)}", mình sẽ kiểm tra và phản hồi trong thời gian sớm nhất. Bạn vui lòng cung cấp thêm mã đơn hàng (nếu có) để mình hỗ trợ nhanh hơn nhé! 😊`,
            priority: 'medium',
            confidence: 0.5,
        });
    }
}
