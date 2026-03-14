import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { geminiRemoveBackground } from '@/lib/ai/gemini';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import path from 'path';
import db from '@/lib/db';

const NOBG_DIR = path.join(process.cwd(), 'public', 'uploads', 'products', 'no-bg');

/**
 * POST /api/admin/remove-bg/bulk
 * Process background removal for ALL products that have images but no no-bg version yet.
 * Returns SSE stream of real-time progress.
 */
export async function POST(req: NextRequest) {
    const authError = requireAdmin(req, 'products');
    if (authError) return authError;

    const body = await req.json().catch(() => ({}));
    const forceAll = body.force === true;

    // Set up SSE streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: Record<string, unknown>) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                await mkdir(NOBG_DIR, { recursive: true });

                // Get all products with media
                let products: { id: string; name: string; slug: string; media: { url: string }[] }[];
                try {
                    products = await db.product.findMany({
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            media: { take: 1, orderBy: { sort: 'asc' }, select: { url: true } },
                        },
                    });
                } catch {
                    const catalogProducts = (await import('@/data/products.json')).default;
                    products = (catalogProducts as any[]).map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        media: (p.images || []).slice(0, 1).map((url: string) => ({ url })),
                    }));
                }

                // Filter: only products with images and without existing no-bg
                const toProcess: typeof products = [];
                for (const p of products) {
                    if (!p.media?.[0]?.url) continue;
                    if (!forceAll) {
                        const noBgPath = path.join(NOBG_DIR, `${p.slug}-no-bg.png`);
                        try {
                            await access(noBgPath);
                            continue;
                        } catch {
                            // doesn't exist, needs processing
                        }
                    }
                    toProcess.push(p);
                }

                // Send initial info
                send({
                    type: 'init',
                    total: toProcess.length,
                    totalProducts: products.length,
                    skipped: products.length - toProcess.length,
                });

                if (toProcess.length === 0) {
                    send({
                        type: 'done',
                        message: 'Tất cả sản phẩm đã có ảnh tách nền!',
                        processed: 0,
                        errors: 0,
                        total: products.length,
                    });
                    controller.close();
                    return;
                }

                let successCount = 0;
                let errorCount = 0;

                for (let i = 0; i < toProcess.length; i++) {
                    const p = toProcess[i];
                    // Send progress update
                    send({
                        type: 'progress',
                        current: i + 1,
                        total: toProcess.length,
                        productName: p.name,
                        productSlug: p.slug,
                        status: 'processing',
                    });

                    try {
                        const imageUrl = p.media[0].url;
                        const imgPath = path.join(process.cwd(), 'public', imageUrl);
                        const imgBuffer = await readFile(imgPath);
                        const imgBase64 = imgBuffer.toString('base64');

                        const noBgBase64 = await geminiRemoveBackground(imgBase64, p.name);

                        const noBgFilename = `${p.slug}-no-bg.png`;
                        const noBgPath = path.join(NOBG_DIR, noBgFilename);
                        await writeFile(noBgPath, Buffer.from(noBgBase64, 'base64'));

                        const url = `/uploads/products/no-bg/${noBgFilename}`;
                        successCount++;
                        console.log(`[Bulk BG] ✓ ${p.name} → ${url}`);

                        send({
                            type: 'progress',
                            current: i + 1,
                            total: toProcess.length,
                            productName: p.name,
                            productSlug: p.slug,
                            status: 'ok',
                            url,
                        });
                    } catch (err) {
                        const message = err instanceof Error ? err.message : 'Unknown error';
                        errorCount++;
                        console.error(`[Bulk BG] ✗ ${p.name}:`, message);

                        send({
                            type: 'progress',
                            current: i + 1,
                            total: toProcess.length,
                            productName: p.name,
                            productSlug: p.slug,
                            status: 'error',
                            error: message,
                        });
                    }
                }

                // Send final summary
                send({
                    type: 'done',
                    message: `Đã tách nền ${successCount}/${toProcess.length} sản phẩm${errorCount > 0 ? ` (${errorCount} lỗi)` : ''}`,
                    processed: successCount,
                    errors: errorCount,
                    total: products.length,
                });
            } catch (error: unknown) {
                console.error('[Bulk BG Remove]', error);
                const message = error instanceof Error ? error.message : 'Lỗi không xác định';
                send({ type: 'error', message: `Lỗi tách nền hàng loạt: ${message}` });
            }

            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
