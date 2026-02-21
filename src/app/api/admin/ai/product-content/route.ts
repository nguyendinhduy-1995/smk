import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

const SYSTEM_PROMPT = `Bạn là chuyên gia viết nội dung sản phẩm kính mắt cho cửa hàng "Siêu Thị Mắt Kính".

QUY TẮC BẮT BUỘC:
1. Nếu không chắc chắn thông số (lens width, bridge, temple length, material) → ĐỂ TRỐNG (null) và thêm disclaimer
2. KHÔNG bịa thông số vật liệu nếu không rõ từ ảnh
3. KHÔNG hứa hẹn về y tế/điều trị
4. Tất cả giá phải đúng với giá user cung cấp
5. Nội dung phải phù hợp với tone voice được chọn

OUTPUT phải là JSON hợp lệ theo schema sau:
{
  "titleOptions": ["...", "...", "..."],
  "shortDesc": "...",
  "longDesc": "...",
  "bullets": ["...", "...", "..."],
  "inferredAttributes": {
    "shape": {"value": "...", "confidence": 0.9},
    "material": {"value": "...", "confidence": 0.7},
    "style": {"value": "...", "confidence": 0.8},
    "targetGender": {"value": "...", "confidence": 0.6},
    "usage": {"value": "...", "confidence": 0.8}
  },
  "suggestedSpecs": {
    "lensWidth": null,
    "bridge": null,
    "templeLength": null,
    "frameShape": "...",
    "material": null
  },
  "tags": ["...", "..."],
  "seo": {
    "metaTitle": "...",
    "metaDescription": "...",
    "slug": "..."
  },
  "social": {
    "facebook": ["..."],
    "tiktokCaption": ["..."],
    "zalo": ["..."]
  },
  "disclaimers": ["..."]
}`;

const TONE_MAP: Record<string, string> = {
    casual: 'Giọng bình dân, thân thiện, dễ hiểu, hướng đại chúng',
    premium: 'Giọng sang trọng, tinh tế, dành cho khách hàng cao cấp',
    young: 'Giọng trẻ trung, năng động, Gen Z, trendy',
    kol_review: 'Giọng như KOL/influencer review sản phẩm, chân thật, có cảm xúc',
};

const CHANNEL_MAP: Record<string, string> = {
    website: 'Nội dung cho trang web, SEO-friendly, đầy đủ thông tin',
    facebook: 'Post Facebook ngắn gọn, có emoji, hook mạnh, CTA rõ',
    tiktok: 'Caption TikTok ngắn, viral, trending hashtag, hài hước/cuốn hút',
    zalo: 'Tin nhắn Zalo OA, lịch sự, chuyên nghiệp, có ưu đãi',
};

/* ═══ POST /api/admin/ai/product-content ═══ */
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { name, price, imageUrls = [], channel = 'website', tone = 'casual' } = body;

    if (!name) {
        return NextResponse.json({ error: 'Tên sản phẩm là bắt buộc' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
        // Fallback: generate template content without AI
        const result = generateFallbackContent(name, price, channel, tone);
        await db.aIContentLog.create({
            data: { channel, tone, input: body, output: result, tokens: 0, latencyMs: 0, applied: false, createdBy: 'system' },
        });
        return NextResponse.json(result);
    }

    const start = Date.now();

    try {
        const toneDesc = TONE_MAP[tone] || TONE_MAP.casual;
        const channelDesc = CHANNEL_MAP[channel] || CHANNEL_MAP.website;

        const userPrompt = `Sản phẩm: ${name}
Giá: ${price ? new Intl.NumberFormat('vi-VN').format(price) + 'đ' : 'Chưa có'}
Tone: ${toneDesc}
Kênh: ${channelDesc}
Số ảnh: ${imageUrls.length}

Hãy tạo nội dung cho sản phẩm kính mắt trên. Trả về JSON theo schema đã cho.`;

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        // If images provided, use vision
        if (imageUrls.length > 0) {
            const content: OpenAI.Chat.ChatCompletionContentPart[] = [
                { type: 'text', text: userPrompt },
                ...imageUrls.slice(0, 5).map((url: string) => ({
                    type: 'image_url' as const,
                    image_url: { url, detail: 'low' as const },
                })),
            ];
            messages.push({ role: 'user', content });
        } else {
            messages.push({ role: 'user', content: userPrompt });
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            max_tokens: 2000,
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });

        const rawOutput = completion.choices[0]?.message?.content || '{}';
        const output = JSON.parse(rawOutput);
        const latencyMs = Date.now() - start;
        const tokens = completion.usage?.total_tokens || 0;

        // Log usage
        await db.aIContentLog.create({
            data: { channel, tone, input: body, output, tokens, latencyMs, applied: false, createdBy: 'system' },
        });

        return NextResponse.json(output);
    } catch (e: unknown) {
        console.error('[AI Content]', e);
        // Fallback on error
        const result = generateFallbackContent(name, price, channel, tone);
        return NextResponse.json(result);
    }
}

function generateFallbackContent(name: string, price: number, channel: string, tone: string) {
    const priceStr = price ? new Intl.NumberFormat('vi-VN').format(price) + 'đ' : '';
    const toneAdj = tone === 'premium' ? 'sang trọng' : tone === 'young' ? 'cá tính' : 'thời trang';

    return {
        titleOptions: [
            `${name} - ${toneAdj} & Phong Cách`,
            `Kính mắt ${name} chính hãng`,
            `${name} | Siêu Thị Mắt Kính`,
        ],
        shortDesc: `${name} – mẫu kính ${toneAdj} bán chạy tại Siêu Thị Mắt Kính. Chất lượng cao, bảo hành chính hãng.${priceStr ? ` Giá chỉ ${priceStr}.` : ''}`,
        longDesc: `${name} là sản phẩm kính mắt ${toneAdj} được yêu thích nhất tại Siêu Thị Mắt Kính. Thiết kế hiện đại, chất liệu cao cấp, phù hợp mọi khuôn mặt. Sản phẩm có bảo hành chính hãng, đổi trả trong 30 ngày.`,
        bullets: [
            'Thiết kế hiện đại, phù hợp nhiều phong cách',
            'Chất liệu cao cấp, bền bỉ',
            'Bảo hành chính hãng',
            'Đổi trả 30 ngày',
            'Miễn phí ship từ 500.000đ',
        ],
        inferredAttributes: {
            shape: { value: null, confidence: 0 },
            material: { value: null, confidence: 0 },
            style: { value: toneAdj, confidence: 0.5 },
            targetGender: { value: 'unisex', confidence: 0.3 },
            usage: { value: 'daily', confidence: 0.3 },
        },
        suggestedSpecs: { lensWidth: null, bridge: null, templeLength: null, frameShape: null, material: null },
        tags: ['kính mắt', name.toLowerCase(), toneAdj],
        seo: {
            metaTitle: `${name} - Mua kính mắt chính hãng | Siêu Thị Mắt Kính`,
            metaDescription: `Mua ${name} chính hãng tại Siêu Thị Mắt Kính.${priceStr ? ` Giá ${priceStr}.` : ''} Bảo hành, đổi trả 30 ngày, ship toàn quốc.`,
            slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-'),
        },
        social: {
            facebook: [
                channel === 'facebook' ? `🔥 ${name} – ${toneAdj} cực đỉnh!\n${priceStr ? `💰 Chỉ ${priceStr}` : ''}\n🎁 Freeship + Bảo hành 12 tháng\n👉 Inbox/comment để đặt hàng!` : `${name} – ${priceStr}`,
            ],
            tiktokCaption: [`${name} review nhanh 🧐 #kínhmắt #sunglasses #sieuthimatkinh`],
            zalo: [`Kính ${name} ${priceStr ? `giá ${priceStr}` : ''} – bảo hành 12 tháng. Liên hệ tư vấn ngay!`],
        },
        disclaimers: ['Thông số kính (lens width, bridge, temple) cần xác nhận thủ công'],
    };
}
