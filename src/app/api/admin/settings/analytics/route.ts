import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "ga-config.json");

interface GAConfig {
    gaId: string;
    enabled: boolean;
    updatedAt: string;
}

const DEFAULT_CONFIG: GAConfig = {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    enabled: true,
    updatedAt: "",
};

async function verifyAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get("smk_admin_session");
    if (!session?.value) return false;
    try {
        const parts = session.value.split(".");
        if (parts.length !== 3) return false;
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        return payload.role === "ADMIN";
    } catch { return false; }
}

async function getConfig(): Promise<GAConfig> {
    try {
        const data = await fs.readFile(CONFIG_PATH, "utf-8");
        return JSON.parse(data);
    } catch { return DEFAULT_CONFIG; }
}

async function saveConfig(config: GAConfig): Promise<void> {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export async function GET() {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(await getConfig());
}

export async function POST(request: Request) {
    if (!(await verifyAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        const config: GAConfig = {
            gaId: body.gaId ?? "",
            enabled: body.enabled ?? true,
            updatedAt: new Date().toISOString(),
        };
        await saveConfig(config);
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
