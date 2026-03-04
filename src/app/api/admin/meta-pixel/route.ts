import crypto from 'crypto';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "meta-pixel-config.json");

interface MetaPixelConfig {
    pixelId: string;
    accessToken: string;
    enabled: boolean;
    events: {
        PageView: boolean;
        ViewContent: boolean;
        AddToCart: boolean;
        AddToWishlist: boolean;
        InitiateCheckout: boolean;
        AddPaymentInfo: boolean;
        Purchase: boolean;
        Search: boolean;
        Contact: boolean;
    };
    updatedAt: string;
}

const DEFAULT_CONFIG: MetaPixelConfig = {
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
    accessToken: process.env.META_CAPI_ACCESS_TOKEN || "",
    enabled: true,
    events: {
        PageView: true,
        ViewContent: true,
        AddToCart: true,
        AddToWishlist: true,
        InitiateCheckout: true,
        AddPaymentInfo: true,
        Purchase: true,
        Search: true,
        Contact: true,
    },
    updatedAt: new Date().toISOString(),
};

async function getConfig(): Promise<MetaPixelConfig> {
    try {
        const data = await fs.readFile(CONFIG_PATH, "utf-8");
        return JSON.parse(data);
    } catch {
        return DEFAULT_CONFIG;
    }
}

async function saveConfig(config: MetaPixelConfig): Promise<void> {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

async function verifyAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get("smk_admin_session");
    if (!session?.value) return false;
    try {
        const parts = session.value.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        return payload.role === "ADMIN";
    } catch {
        return false;
    }
}

export async function GET() {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const config = await getConfig();
    // Mask access token for security
    const masked = {
        ...config,
        accessToken: config.accessToken
            ? config.accessToken.slice(0, 12) + "..." + config.accessToken.slice(-6)
            : "",
        accessTokenSet: !!config.accessToken,
    };
    return NextResponse.json(masked);
}

export async function PUT(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const current = await getConfig();
        const updated: MetaPixelConfig = {
            pixelId: body.pixelId ?? current.pixelId,
            accessToken: body.accessToken === undefined ? current.accessToken : body.accessToken,
            enabled: body.enabled ?? current.enabled,
            events: { ...current.events, ...(body.events || {}) },
            updatedAt: new Date().toISOString(),
        };
        await saveConfig(updated);
        return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}

export async function POST(request: Request) {
    // Test CAPI connection
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const config = await getConfig();
    if (!config.pixelId || !config.accessToken) {
        return NextResponse.json({ error: "Pixel ID or Access Token not configured" }, { status: 400 });
    }
    try {
        // Get real client info from request headers
        const fwd = request.headers.get('x-forwarded-for');
        const cip = fwd ? fwd.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1');
        const cua = request.headers.get('user-agent') || 'Mozilla/5.0';
        const h = (v: string) => crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex');
        
        const testPayload = {
            data: [{
                event_name: "PageView",
                event_time: Math.floor(Date.now() / 1000),
                event_id: `test_${Date.now()}`,
                event_source_url: "https://sieuthimatkinh.vn/",
                action_source: "website",
                user_data: {
                    client_ip_address: cip,
                    client_user_agent: cua,
                    em: [h('admin@sieuthimatkinh.vn')],
                    ph: [h('84123456789')],
                    fn: [h('admin')],
                    ln: [h('smk')],
                    ct: [h('ho chi minh')],
                    st: [h('ho chi minh')],
                    zp: [h('700000')],
                    country: [h('vn')],
                    external_id: [h('smk_admin_test')],
                },
            }],
            test_event_code: "TEST00001",
        };
        const url = `https://graph.facebook.com/v22.0/${config.pixelId}/events?access_token=${config.accessToken}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testPayload),
        });
        const result = await res.json();
        if (res.ok) {
            return NextResponse.json({ success: true, result });
        } else {
            return NextResponse.json({ success: false, error: result }, { status: 400 });
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
