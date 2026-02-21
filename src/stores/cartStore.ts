'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

export interface CartItemData {
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    sku: string;
    frameColor: string;
    lensColor?: string;
    price: number;
    compareAtPrice?: number;
    imageUrl?: string;
    qty: number;
}

interface CartState {
    items: CartItemData[];
    couponCode: string | null;
    _hasHydrated: boolean;
    // Actions
    addItem: (item: Omit<CartItemData, 'qty'>, qty?: number) => void;
    removeItem: (variantId: string) => void;
    updateQty: (variantId: string, qty: number) => void;
    setCoupon: (code: string | null) => void;
    clearCart: () => void;
    setHasHydrated: (v: boolean) => void;
    // Computed
    totalItems: () => number;
    subtotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            couponCode: null,
            _hasHydrated: false,

            setHasHydrated: (v) => set({ _hasHydrated: v }),

            addItem: (item, qty = 1) => {
                const items = get().items;
                const existing = items.find((i) => i.variantId === item.variantId);

                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.variantId === item.variantId
                                ? { ...i, qty: i.qty + qty }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, { ...item, qty }] });
                }
            },

            removeItem: (variantId) => {
                set({ items: get().items.filter((i) => i.variantId !== variantId) });
            },

            updateQty: (variantId, qty) => {
                if (qty <= 0) {
                    get().removeItem(variantId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.variantId === variantId ? { ...i, qty } : i
                    ),
                });
            },

            setCoupon: (code) => set({ couponCode: code }),

            clearCart: () => set({ items: [], couponCode: null }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

            subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
        }),
        {
            name: 'smk-cart',
            version: 1,
            // Defer hydration to prevent SSR mismatch
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

/**
 * Hook to safely access cart data after hydration
 * Use this in components that show cart count to avoid SSR mismatches
 */
export function useCartHydrated() {
    const hasHydrated = useCartStore((s) => s._hasHydrated);
    return hasHydrated;
}

