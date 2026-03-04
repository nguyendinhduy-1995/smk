/**
 * Meta Conversions API (CAPI) — Server-side event tracking
 * Sends events to Facebook for better attribution & deduplication
 */
import crypto from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const API_VERSION = "v22.0";

function hashSHA256(value: string): string {
    return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface CAPIUserData {
    email?: string;
    phone?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string; // _fbc cookie
    fbp?: string; // _fbp cookie
}

interface CAPIEventData {
    eventName: string;
    eventId: string; // for deduplication with Pixel
    eventSourceUrl?: string;
    userData: CAPIUserData;
    customData?: Record<string, unknown>;
}

export async function sendCAPIEvent(data: CAPIEventData): Promise<boolean> {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
        console.warn("[Meta CAPI] Missing PIXEL_ID or ACCESS_TOKEN, skipping.");
        return false;
    }

    const userDataPayload: Record<string, unknown> = {};
    if (data.userData.email) userDataPayload.em = [hashSHA256(data.userData.email)];
    if (data.userData.phone) userDataPayload.ph = [hashSHA256(data.userData.phone)];
    if (data.userData.clientIpAddress) userDataPayload.client_ip_address = data.userData.clientIpAddress;
    if (data.userData.clientUserAgent) userDataPayload.client_user_agent = data.userData.clientUserAgent;
    if (data.userData.fbc) userDataPayload.fbc = data.userData.fbc;
    if (data.userData.fbp) userDataPayload.fbp = data.userData.fbp;

    const eventPayload = {
        data: [
            {
                event_name: data.eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: data.eventId,
                event_source_url: data.eventSourceUrl,
                action_source: "website",
                user_data: userDataPayload,
                custom_data: data.customData || {},
            },
        ],
        // test_event_code: "TEST12345", // Uncomment for testing
    };

    try {
        const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(eventPayload),
        });

        if (!res.ok) {
            const errBody = await res.text();
            console.error(`[Meta CAPI] Error ${res.status}: ${errBody}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[Meta CAPI] Network error:", err);
        return false;
    }
}

// Convenience helpers for common e-commerce events
export const metaCAPI = {
    purchase: (orderId: string, total: number, currency: string, userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "Purchase",
            eventId: `purchase_${orderId}`,
            eventSourceUrl: sourceUrl,
            userData,
            customData: { value: total, currency, order_id: orderId },
        }),

    addToCart: (productId: string, productName: string, value: number, userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "AddToCart",
            eventId: `atc_${productId}_${Date.now()}`,
            eventSourceUrl: sourceUrl,
            userData,
            customData: { content_ids: [productId], content_name: productName, value, currency: "VND", content_type: "product" },
        }),

    initiateCheckout: (value: number, numItems: number, userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "InitiateCheckout",
            eventId: `ic_${Date.now()}`,
            eventSourceUrl: sourceUrl,
            userData,
            customData: { value, currency: "VND", num_items: numItems },
        }),

    viewContent: (productId: string, productName: string, value: number, userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "ViewContent",
            eventId: `vc_${productId}_${Date.now()}`,
            eventSourceUrl: sourceUrl,
            userData,
            customData: { content_ids: [productId], content_name: productName, value, currency: "VND", content_type: "product" },
        }),

    search: (query: string, userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "Search",
            eventId: `search_${Date.now()}`,
            eventSourceUrl: sourceUrl,
            userData,
            customData: { search_string: query },
        }),

    contact: (userData: CAPIUserData, sourceUrl?: string) =>
        sendCAPIEvent({
            eventName: "Contact",
            eventId: `contact_${Date.now()}`,
            eventSourceUrl: sourceUrl,
            userData,
        }),
};
