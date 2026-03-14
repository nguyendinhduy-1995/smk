import { NextResponse } from 'next/server';
import { getAIConfig } from '@/lib/ai/gemini';
import { randomUUID } from 'crypto';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import path from 'path';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const RESULTS_DIR = path.join(process.cwd(), 'public', 'try-on-results');
const NOBG_DIR = path.join(process.cwd(), 'public', 'uploads', 'products', 'no-bg');
const DEFAULT_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

export async function POST(req: Request) {
    try {
        const { imageBase64, productName, productBrand, frameShape, productSlug, productImageBase64 } = await req.json();

        if (!imageBase64 || !productName) {
            return NextResponse.json({ error: 'Thiếu ảnh hoặc thông tin sản phẩm' }, { status: 400 });
        }

        // Limit base64 size to ~5MB
        if (imageBase64.length > 5 * 1024 * 1024 * 1.37) {
            return NextResponse.json({ error: 'Ảnh quá lớn (tối đa 5MB)' }, { status: 400 });
        }

        // Rate limit using shared module
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        const { allowed } = rateLimit(ip);
        if (!allowed) {
            return rateLimitResponse();
        }

        // Try to load no-bg product image if not provided
        let productImgBase64 = productImageBase64?.replace(/^data:image\/\w+;base64,/, '');
        if (!productImgBase64 && productSlug) {
            try {
                const noBgPath = path.join(NOBG_DIR, `${productSlug}-no-bg.png`);
                await access(noBgPath);
                const noBgBuffer = await readFile(noBgPath);
                productImgBase64 = noBgBuffer.toString('base64');
            } catch {
                // No-bg image not found, will use text-only prompt
            }
        }

        // Build prompt — CRITICAL: preserve 100% original face
        const prompt = productImgBase64
            ? `IMPORTANT RULES:
1. DO NOT alter, modify, or change the person's face, skin, hair, expression, or any facial features in ANY way. The face must remain 100% identical to the original photo.
2. DO NOT change the background, lighting, or any other elements of the original photo.
3. Take the EXACT pair of glasses shown in the second image and place them onto the person's face in the first image.
4. The glasses must be properly positioned on the nose bridge, aligned with the eyes, and sized proportionally to the face.
5. Add subtle, realistic shadow beneath the glasses frames for a natural look.
6. The result must look like a real photo of the person wearing these exact glasses, not a digital overlay.
7. Match the color, shape, material, and style of the glasses EXACTLY as shown in the product image.`
            : `IMPORTANT RULES:
1. DO NOT alter, modify, or change the person's face, skin, hair, expression, or any facial features in ANY way. The face must remain 100% identical to the original photo.
2. DO NOT change the background, lighting, or any other elements of the original photo.
3. ONLY add a pair of ${productName} (${productBrand || 'thương hiệu cao cấp'}, kiểu ${frameShape || 'thời trang'}) glasses onto the person's face.
4. The glasses must be properly positioned on the nose bridge, aligned with the eyes, and sized proportionally to the face.
5. Add subtle, realistic shadow beneath the glasses frames for a natural look.
6. The result must look like a real photo of the person wearing these glasses, not a digital overlay.`;

        // Call Gemini with face + optional product image
        const config = await getAIConfig();
        const apiKey = config.googleKey || process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Key chưa được cấu hình. Vào Admin → AI → nhập Google API Key.');

        const tryOnConfig = config.features?.['/try-on'];
        const model = tryOnConfig?.model || DEFAULT_IMAGE_MODEL;

        const systemPrompt = tryOnConfig?.systemPrompt;
        const finalPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        // Build parts: text + face image + optional product image
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
            { text: finalPrompt },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        ];

        if (productImgBase64) {
            parts.push({ inlineData: { mimeType: 'image/png', data: productImgBase64 } });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts }],
                generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            console.error('[Try-on Gemini] Error:', err);
            throw new Error(`Gemini API lỗi (${res.status}): ${err.slice(0, 200)}`);
        }

        const data = await res.json();
        const resParts = data.candidates?.[0]?.content?.parts;
        if (!resParts?.length) {
            throw new Error('Gemini không trả về kết quả');
        }

        let resultBase64 = '';
        for (const part of resParts) {
            if (part.inlineData?.data) {
                resultBase64 = part.inlineData.data;
                break;
            }
        }

        if (!resultBase64) {
            const textPart = resParts.find((p: { text?: string }) => p.text);
            if (textPart?.text) throw new Error(`Gemini: ${textPart.text.slice(0, 200)}`);
            throw new Error('Gemini không trả về ảnh kết quả');
        }

        // Save to disk
        await mkdir(RESULTS_DIR, { recursive: true });
        const filename = `${randomUUID()}.png`;
        const filepath = path.join(RESULTS_DIR, filename);
        await writeFile(filepath, Buffer.from(resultBase64, 'base64'));

        const resultUrl = `/try-on-results/${filename}`;

        return NextResponse.json({
            success: true,
            resultUrl,
            resultBase64: `data:image/png;base64,${resultBase64}`,
            usedProductImage: !!productImgBase64,
        });
    } catch (error: unknown) {
        console.error('Try-on error:', error);
        const message = error instanceof Error ? error.message : 'Lỗi không xác định';
        return NextResponse.json({ error: `Lỗi xử lý: ${message}` }, { status: 500 });
    }
}
