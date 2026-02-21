import { notFound } from 'next/navigation';
import allProducts from '@/data/products.json';
import ProductDetailClient from './ProductDetailClient';

type Product = {
    id: string; slug: string; name: string; price: number;
    compareAt: number | null; category: string;
    image: string | null; images: string[]; description: string;
    brand?: string | null; sku?: string | null;
};

const products = allProducts as Product[];

export function generateStaticParams() {
    return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = products.find((p) => p.slug === slug);
    if (!product) notFound();

    // Build variant from product data
    const variant = {
        id: `v-${product.id}`,
        sku: product.sku || `SKU-${product.id}`,
        frameColor: 'Mặc định',
        lensColor: null as string | null,
        price: product.price,
        compareAtPrice: product.compareAt,
        stockQty: 10,
    };

    // Gallery from actual images
    const galleryImages = product.images.length > 0
        ? product.images
        : product.image ? [product.image] : [];

    return <ProductDetailClient product={product} variant={variant} galleryImages={galleryImages} />;
}
