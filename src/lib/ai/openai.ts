import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

// Helper: GPT-4o-mini completion
export async function chatCompletion(
    systemPrompt: string,
    userMessage: string,
    options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 1000,
    });

    return response.choices[0]?.message?.content || '';
}

// Helper: GPT-4o vision (for image analysis)
export async function visionAnalysis(
    imageBase64: string,
    prompt: string
): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
                    },
                ],
            },
        ],
        max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
}

// Helper: Image generation/edit for try-on compositing
export async function imageEdit(
    imageBase64: string,
    prompt: string
): Promise<string> {
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const file = new File([imageBuffer], 'face.png', { type: 'image/png' });

    const response = await openai.images.edit({
        model: 'gpt-image-1',
        image: file,
        prompt,
        size: '1024x1024',
    });

    return response.data?.[0]?.b64_json || '';
}
