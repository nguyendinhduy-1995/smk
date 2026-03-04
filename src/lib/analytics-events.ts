"use client";

// Analytics event tracking utility
// Fires GA4 events + Meta Pixel fbq events + stores locally for A/B test correlation

type EventName =
    | "view_item"
    | "add_to_cart"
    | "add_to_wishlist"
    | "begin_checkout"
    | "add_payment_info"
    | "purchase"
    | "search"
    | "contact"
    | "quiz_start"
    | "quiz_complete"
    | "try_on_start"
    | "share_product"
    | "apply_voucher"
    | "partner_link_copy"
    | "partner_kit_download"
    | "flash_sale_click"
    | "bundle_select"
    | "review_helpful";

interface EventParams {
    [key: string]: string | number | boolean | undefined;
}

// Helper: fire GA4 event
function fireGA4(event: string, params?: EventParams) {
    if (typeof window !== "undefined" && (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", event, params);
    }
}

// Helper: fire Meta Pixel event
function fireFBQ(event: string, params?: Record<string, unknown>) {
    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        if (params) {
            (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", event, params);
        } else {
            (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", event);
        }
    }
}

// Store events locally for debugging
function storeLocal(event: string, params?: EventParams) {
    if (typeof window !== "undefined") {
        try {
            const key = "smk_events";
            const raw = localStorage.getItem(key);
            const events = raw ? JSON.parse(raw) : [];
            events.push({ event, params, timestamp: Date.now() });
            if (events.length > 100) events.splice(0, events.length - 100);
            localStorage.setItem(key, JSON.stringify(events));
        } catch { /* silently fail */ }
    }
}

export function trackEvent(event: EventName, params?: EventParams) {
    fireGA4(event, params);
    storeLocal(event, params);
}

// Convenience wrappers — fire both GA4 + Meta Pixel
export const analytics = {
    viewItem: (slug: string, name: string, price: number) => {
        trackEvent("view_item", { item_id: slug, item_name: name, value: price });
        fireFBQ("ViewContent", { content_ids: [slug], content_name: name, value: price, currency: "VND", content_type: "product" });
    },

    addToCart: (slug: string, name: string, price: number, qty: number) => {
        trackEvent("add_to_cart", { item_id: slug, item_name: name, value: price, quantity: qty });
        fireFBQ("AddToCart", { content_ids: [slug], content_name: name, value: price, currency: "VND", content_type: "product" });
    },

    addToWishlist: (slug: string, name: string, price: number) => {
        trackEvent("add_to_wishlist", { item_id: slug, item_name: name, value: price });
        fireFBQ("AddToWishlist", { content_ids: [slug], content_name: name, value: price, currency: "VND", content_type: "product" });
    },

    beginCheckout: (total: number, itemCount: number) => {
        trackEvent("begin_checkout", { value: total, items: itemCount });
        fireFBQ("InitiateCheckout", { value: total, currency: "VND", num_items: itemCount });
    },

    addPaymentInfo: (paymentMethod: string) => {
        trackEvent("add_payment_info", { payment_type: paymentMethod });
        fireFBQ("AddPaymentInfo", { payment_method: paymentMethod });
    },

    purchase: (orderId: string, total: number) => {
        trackEvent("purchase", { transaction_id: orderId, value: total });
        fireFBQ("Purchase", { value: total, currency: "VND", order_id: orderId });
    },

    search: (query: string) => {
        trackEvent("search", { search_term: query });
        fireFBQ("Search", { search_string: query });
    },

    contact: (method?: string) => {
        trackEvent("contact", { contact_method: method });
        fireFBQ("Contact");
    },

    quizStart: () => trackEvent("quiz_start"),
    quizComplete: (face: string, style: string, budget: string) =>
        trackEvent("quiz_complete", { face_shape: face, style, budget }),

    tryOnStart: () => trackEvent("try_on_start"),
    shareProduct: (slug: string) => trackEvent("share_product", { item_id: slug }),
    applyVoucher: (code: string) => trackEvent("apply_voucher", { coupon: code }),
    flashSaleClick: () => trackEvent("flash_sale_click"),
    bundleSelect: (bundleId: string) => trackEvent("bundle_select", { bundle_id: bundleId }),
    reviewHelpful: (reviewId: string) => trackEvent("review_helpful", { review_id: reviewId }),
    partnerLinkCopy: (code: string) => trackEvent("partner_link_copy", { partner_code: code }),
    partnerKitDownload: (product: string) => trackEvent("partner_kit_download", { product }),
};
