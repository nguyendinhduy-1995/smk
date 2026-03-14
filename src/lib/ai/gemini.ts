import { readFile } from 'fs/promises';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'data', 'ai-config.json');

// Default image generation model (Nano Banana 2 — recommended by Google for image editing)
const DEFAULT_IMAGE_MODEL = 'gemini-3.1-flash-image-preview';

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

/**
 * Read full AI config from the config file (set via /admin/ai)
 */
export async function getAIConfig(): Promise<AIConfigData> {
    try {
        const raw = await readFile(CONFIG_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/**
 * Image edit using Gemini via REST API (Nano Banana / Imagen 4)
 * Model is configurable via Admin → AI → AR Try-On card
 * Sends user's face photo + prompt → receives edited image with glasses overlay
 */
export async function geminiImageEdit(
    imageBase64: string,
    prompt: string,
    options?: { model?: string; mimeType?: string }
): Promise<string> {
    const config = await getAIConfig();
    const apiKey = config.googleKey || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new Error('Google API Key chưa được cấu hình. Vào Admin → AI → nhập Google API Key.');

    // Use model from options, or from admin config for /try-on endpoint, or default
    const tryOnConfig = config.features?.['/try-on'];
    const model = options?.model || tryOnConfig?.model || DEFAULT_IMAGE_MODEL;
    const mimeType = options?.mimeType || 'image/jpeg';

    // Get system prompt from admin config if available
    const systemPrompt = tryOnConfig?.systemPrompt;
    const finalPrompt = systemPrompt
        ? `${systemPrompt}\n\n${prompt}`
        : prompt;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                role: 'user',
                parts: [
                    { text: finalPrompt },
                    {
                        inlineData: {
                            mimeType,
                            data: imageBase64,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
        },
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error('[Gemini Image Edit] Error:', err);
        throw new Error(`Gemini API lỗi (${res.status}): ${err.slice(0, 200)}`);
    }

    const data = await res.json();

    // Extract image from response
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts || parts.length === 0) {
        throw new Error('Gemini không trả về kết quả');
    }

    for (const part of parts) {
        if (part.inlineData?.data) {
            return part.inlineData.data; // base64 image
        }
    }

    // Check if there's a text-only response (error or refusal)
    const textPart = parts.find((p: { text?: string }) => p.text);
    if (textPart?.text) {
        throw new Error(`Gemini: ${textPart.text.slice(0, 200)}`);
    }

    throw new Error('Gemini không trả về ảnh kết quả');
}

/**
 * Remove background from a product image using Gemini.
 * Returns base64 PNG with transparent background.
 */
export async function geminiRemoveBackground(
    imageBase64: string,
    productName?: string,
    options?: { model?: string; mimeType?: string }
): Promise<string> {
    const prompt = `Remove the background from this product image completely. Make the background fully transparent.
Keep ONLY the eyewear/glasses product itself - preserve every detail of the frame, lenses, temples, and nose pads.
The output must be a clean cutout of just the glasses/eyewear with NO background at all.
${productName ? `Product: ${productName}` : ''}
Do NOT add any shadows, reflections, or other effects. Just the product on a transparent background.`;

    return geminiImageEdit(imageBase64, prompt, {
        model: options?.model,
        mimeType: options?.mimeType || 'image/png',
    });
}
