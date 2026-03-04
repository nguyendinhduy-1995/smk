import { NextResponse } from 'next/server';
import { imageEdit } from '@/lib/ai/openai';
import { randomUUID } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const RESULTS_DIR = path.join(process.cwd(), 'public', 'try-on-results');

export async function POST(req: Request) {
    try {
        const { imageBase64, productName, productBrand, frameShape } = await req.json();

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

        // Build prompt — CRITICAL: preserve 100% original face
        const prompt = `IMPORTANT RULES:
1. DO NOT alter, modify, or change the person's face, skin, hair, expression, or any facial features in ANY way. The face must remain 100% identical to the original photo.
2. DO NOT change the background, lighting, or any other elements of the original photo.
3. ONLY add a pair of ${productName} (${productBrand || 'thương hiệu cao cấp'}, kiểu ${frameShape || 'thời trang'}) glasses onto the person's face.
4. The glasses must be properly positioned on the nose bridge, aligned with the eyes, and sized proportionally to the face.
5. Add subtle, realistic shadow beneath the glasses frames for a natural look.
6. The result must look like a real photo of the person wearing these glasses, not a digital overlay.`;

        // Call OpenAI
        const resultBase64 = await imageEdit(imageBase64, prompt);

        if (!resultBase64) {
            return NextResponse.json({ error: 'Không tạo được ảnh. Vui lòng thử lại.' }, { status: 500 });
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
        });
    } catch (error: unknown) {
        console.error('Try-on error:', error);
        const message = error instanceof Error ? error.message : 'Lỗi không xác định';
        return NextResponse.json({ error: `Lỗi xử lý: ${message}` }, { status: 500 });
    }
}
