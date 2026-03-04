import { notFound } from 'next/navigation';
import { getProductBySlug, type ProductItem } from '@/lib/product-queries';
import ProductDetailClient from './ProductDetailClient';

type Product = ProductItem;

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
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

    return <ProductDetailClient product={{...product, category: product.category || ""}} variant={variant} galleryImages={galleryImages} />;
}
