'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProduct {
    id: string;
    slug: string;
    name: string;
    brand?: string;
    price: number;
    imageUrl?: string;
    viewedAt: number;
}

interface RecentlyViewedState {
    products: RecentProduct[];
    addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void;
    clearAll: () => void;
}

const MAX_RECENT = 30;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
    persist(
        (set, get) => ({
            products: [],

            addProduct: (product) => {
                const products = get().products.filter((p) => p.id !== product.id);
                products.unshift({ ...product, viewedAt: Date.now() });
                set({ products: products.slice(0, MAX_RECENT) });
            },

            clearAll: () => set({ products: [] }),
        }),
        {
            name: 'smk-recently-viewed',
            version: 1,
        }
    )
);
