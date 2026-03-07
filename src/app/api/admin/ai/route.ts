import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

const CONFIG_DIR = path.join(process.cwd(), '.data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'ai-config.json');

interface AIConfigData {
    openaiKey?: string;
    googleKey?: string;
    features?: Record<string, {
        enabled: boolean;
        provider: string;
        model: string;
        temperature: number;
        maxTokens: number;
        systemPrompt: string;
        customInstructions: string;
    }>;
}

async function readConfig(): Promise<AIConfigData> {
    try {
        const raw = await readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

async function writeConfig(data: AIConfigData): Promise<void> {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// GET /api/admin/ai — load config
export async function GET(req: NextRequest) {
    const authError = requireAdmin(req, 'ai');
    if (authError) return authError;

    const config = await readConfig();
    // Mask keys for security
    return NextResponse.json({
        openaiKey: config.openaiKey ? maskKey(config.openaiKey) : '',
        googleKey: config.googleKey ? maskKey(config.googleKey) : '',
        features: config.features || {},
    });
}

// POST /api/admin/ai — save config
export async function POST(req: NextRequest) {
    const authError = requireAdmin(req, 'ai');
    if (authError) return authError;

    try {
        const body = await req.json();
        const existing = await readConfig();

        // Only update keys if they don't look masked
        if (body.openaiKey && !body.openaiKey.includes('•')) {
            existing.openaiKey = body.openaiKey;
        }
        if (body.googleKey && !body.googleKey.includes('•')) {
            existing.googleKey = body.googleKey;
        }

        // Save features config
        if (body.features) {
            existing.features = body.features;
        }

        await writeConfig(existing);
        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[AI Config Save]', e);
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
}

function maskKey(key: string): string {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(Math.max(4, key.length - 8)) + key.slice(-4);
}
