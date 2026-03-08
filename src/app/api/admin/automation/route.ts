import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'automation-config.json');

async function readConfig(): Promise<Record<string, any>> {
    try {
        const raw = await readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

async function writeConfig(data: Record<string, any>): Promise<void> {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/admin/automation — load workflow config
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, 'automation');
    if (authError) return authError;

    const config = await readConfig();
    return NextResponse.json(config);
}

// POST /api/admin/automation — save workflow config
export async function POST(req: NextRequest) {
    const authError = requireAdmin(req, 'automation');
    if (authError) return authError;

    try {
        const body = await req.json();
        await writeConfig(body);
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[Automation Config Save]', e);
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
}
