import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.ico': 'image/x-icon',
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;
    const filePath = segments.join('/');

    // Security: prevent directory traversal
    if (filePath.includes('..') || filePath.includes('\0')) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    const absolutePath = path.join(process.cwd(), 'public', 'uploads', filePath);

    try {
        const fileStat = await stat(absolutePath);
        if (!fileStat.isFile()) {
            return new NextResponse('Not Found', { status: 404 });
        }

        const buffer = await readFile(absolutePath);
        const ext = path.extname(absolutePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': String(buffer.length),
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return new NextResponse('Not Found', { status: 404 });
    }
}
