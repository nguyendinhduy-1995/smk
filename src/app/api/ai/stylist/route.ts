import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { chatCompletion } from '@/lib/ai/openai';

const SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn kính mắt cho shop "Siêu Thị Mắt Kính" (SMK).
Bạn thông thạo về:
- Các kiểu gọng: Square, Round, Oval, Cat-Eye, Aviator, Rectangle, Geometric, Browline
- Chất liệu: Titanium (siêu nhẹ), TR90 (siêu bền), Acetate (sang trọng), Metal, Mixed
- Khuôn mặt: Tròn (nên chọn vuông/chữ nhật), Dài (nên chọn aviator/to), Vuông (nên chọn tròn/oval), Trái tim (nên chọn aviator/cat-eye), Oval (hợp mọi kiểu)
- Phong cách: Công sở, Cá tính, Thể thao, Retro, Sang trọng

QUY TẮC:
1. Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp
2. Dùng emoji phù hợp
3. Nếu khách hỏi về khuôn mặt, tư vấn cụ thể kiểu gọng phù hợp
4. Gợi ý sản phẩm dựa trên context
5. Luôn kết thúc bằng câu hỏi hoặc gợi ý thêm
6. Giữ câu trả lời ngắn gọn (tối đa 200 từ)
7. Format markdown (bold, bullet points)`;

// POST /api/ai/stylist — AI stylist chat with real OpenAI
export async function POST(req: NextRequest) {
    const { message, history = [] } = await req.json();

    if (!message) {
        return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const lowerMsg = message.toLowerCase();

    // Extract intent for product query
    const intent = detectIntent(lowerMsg);

    // Query matching products from DB
    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (intent.frameShape) where.frameShape = intent.frameShape;
    if (intent.material) where.material = intent.material;
    if (intent.gender) where.gender = intent.gender;
    if (intent.maxPrice) where.variants = { some: { price: { lte: intent.maxPrice }, isActive: true } };

    const products = await db.product.findMany({
        where,
        include: {
            variants: { where: { isActive: true }, orderBy: { price: 'asc' }, take: 1 },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
    });

    // Build product context for GPT
    const productContext = products.length > 0
        ? `\n\nSản phẩm phù hợp trong kho:\n${products.map((p, i) =>
            `${i + 1}. ${p.name} (${p.brand}) — ${new Intl.NumberFormat('vi-VN').format(p.variants[0]?.price || 0)}₫ — Gọng ${p.frameShape || 'N/A'}, Chất liệu ${p.material || 'N/A'}`
        ).join('\n')}`
        : '\n\nKhông tìm thấy sản phẩm nào khớp chính xác. Hãy gợi ý khách mô tả thêm.';

    // Build conversation messages for context
    const conversationContext = history.slice(-6).map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
    }));

    // Call OpenAI
    let reply: string;
    try {
        reply = await chatCompletion(
            SYSTEM_PROMPT + productContext,
            message,
            { temperature: 0.8, maxTokens: 500 }
        );
    } catch {
        // Fallback to simple response if API fails
        reply = products.length > 0
            ? `Dạ, em tìm được **${products.length} sản phẩm** phù hợp cho bạn! Bạn xem qua nhé 👇`
            : 'Dạ bạn có thể cho em biết thêm về sở thích kính mắt không ạ? Ví dụ: kiểu gọng, chất liệu, hoặc ngân sách mong muốn 😊';
    }

    const suggestions = products.map((p) => ({
        slug: p.slug,
        name: p.name,
        brand: p.brand || '',
        price: p.variants[0]?.price || 0,
        frameShape: p.frameShape || '',
        faceMatch: p.faceShape,
        reason: `${p.brand} · ${p.material || 'Premium'}`,
    }));

    return NextResponse.json({ reply, products: suggestions, conversationContext });
}

interface Intent {
    frameShape?: string;
    material?: string;
    gender?: string;
    maxPrice?: number;
}

function detectIntent(msg: string): Intent {
    const intent: Intent = {};

    if (msg.includes('aviator')) intent.frameShape = 'AVIATOR';
    else if (msg.includes('cat') || msg.includes('mắt mèo')) intent.frameShape = 'CAT_EYE';
    else if (msg.includes('tròn') && !msg.includes('mặt')) intent.frameShape = 'ROUND';
    else if (msg.includes('vuông') && !msg.includes('mặt')) intent.frameShape = 'SQUARE';

    if (msg.includes('titanium') || msg.includes('siêu nhẹ')) intent.material = 'TITANIUM';
    else if (msg.includes('acetate')) intent.material = 'ACETATE';
    else if (msg.includes('tr90')) intent.material = 'TR90';

    if (msg.includes(' nam') || msg.includes('đàn ông')) intent.gender = 'MALE';
    else if (msg.includes(' nữ') || msg.includes('phụ nữ')) intent.gender = 'FEMALE';

    if (msg.includes('rẻ') || msg.includes('dưới 3')) intent.maxPrice = 3000000;
    else if (msg.includes('dưới 5') || msg.includes('tầm trung')) intent.maxPrice = 5000000;

    return intent;
}
