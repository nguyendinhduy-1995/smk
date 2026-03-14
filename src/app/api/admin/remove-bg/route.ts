import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { geminiRemoveBackground } from '@/lib/ai/gemini';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const NOBG_DIR = path.join(process.cwd(), 'public', 'uploads', 'products', 'no-bg');

/**
 * POST /api/admin/remove-bg
 * Remove background from a product image using Gemini AI.
 * Input: { imageUrl?: string, imageBase64?: string, productName?: string }
 * Output: { url: string, base64: string }
 */
export async function POST(req: NextRequest) {
    const authError = requireAdmin(req, 'products');
    if (authError) return authError;

    try {
        const { imageUrl, imageBase64, productName } = await req.json();

        let base64Data: string;

        if (imageBase64) {
            // Direct base64 input
            base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        } else if (imageUrl) {
            // Read from local file system (product images are in /public/)
            const localPath = path.join(process.cwd(), 'public', imageUrl);
            try {
                const buffer = await readFile(localPath);
                base64Data = buffer.toString('base64');
            } catch {
                return NextResponse.json(
                    { error: `Không tìm thấy ảnh: ${imageUrl}` },
                    { status: 404 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Cần cung cấp imageUrl hoặc imageBase64' },
                { status: 400 }
            );
        }

        // Call Gemini to remove background
        const resultBase64 = await geminiRemoveBackground(base64Data, productName);

        // Save result  
        await mkdir(NOBG_DIR, { recursive: true });
        const filename = `${randomUUID()}.png`;
        const filepath = path.join(NOBG_DIR, filename);
        await writeFile(filepath, Buffer.from(resultBase64, 'base64'));

        const url = `/uploads/products/no-bg/${filename}`;

        return NextResponse.json({
            success: true,
            url,
            base64: `data:image/png;base64,${resultBase64}`,
        });
    } catch (error: unknown) {
        console.error('[Remove BG]', error);
        const message = error instanceof Error ? error.message : 'Lỗi không xác định';
        return NextResponse.json({ error: `Lỗi tách nền: ${message}` }, { status: 500 });
    }
}
