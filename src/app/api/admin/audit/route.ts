import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const AUDIT_DIR = path.join(process.cwd(), 'data');
const AUDIT_FILE = path.join(AUDIT_DIR, 'audit-log.json');

interface AuditEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    actor: string;
    role: string;
    detail: string;
    ip: string;
    at: string;
}

async function readAuditLog(): Promise<AuditEntry[]> {
    try {
        const raw = await readFile(AUDIT_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

async function appendAuditLog(entry: AuditEntry): Promise<void> {
    const logs = await readAuditLog();
    logs.unshift(entry); // newest first
    // Keep max 1000 entries
    if (logs.length > 1000) logs.length = 1000;
    await mkdir(AUDIT_DIR, { recursive: true });
    await writeFile(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

// GET /api/admin/audit — read audit logs
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, 'audit');
    if (authError) return authError;

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get('page') || 1));
    const limit = Math.min(100, Math.max(10, Number(sp.get('limit') || 50)));

    const logs = await readAuditLog();
    const start = (page - 1) * limit;
    const paged = logs.slice(start, start + limit);

    return NextResponse.json({ logs: paged, total: logs.length, page, limit });
}

// POST /api/admin/audit — append a new audit entry
export async function POST(req: NextRequest) {
    const authError = requireAdmin(req, 'audit');
    if (authError) return authError;

    try {
        const body = await req.json();

        const entry: AuditEntry = {
            id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            action: body.action || 'UPDATE',
            entity: body.entity || 'Unknown',
            entityId: body.entityId || '',
            actor: body.actor || 'Admin',
            role: body.role || 'ADMIN',
            detail: body.detail || '',
            ip: body.ip || '—',
            at: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        };

        await appendAuditLog(entry);
        return NextResponse.json({ ok: true, id: entry.id });
    } catch (e) {
        console.error('[Audit Log Write]', e);
        return NextResponse.json({ error: 'Failed to write audit log' }, { status: 500 });
    }
}
