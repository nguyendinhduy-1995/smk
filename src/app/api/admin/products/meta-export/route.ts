import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

const SITE_URL = 'https://sieuthimatkinh.vn';
const DEFAULT_BRAND = 'SMK';
const GOOGLE_CATEGORY = 'Apparel & Accessories > Clothing Accessories > Sunglasses';

// ── Template header lines (must match Meta Commerce Manager template exactly) ──

const DESCRIPTIVE_HEADER = [
  '# Bắt buộc | A unique content ID for the item.',
  '# Bắt buộc | A specific and relevant title for the item.',
  '# Bắt buộc | A short and relevant description of the item.',
  '# Bắt buộc | The current availability of the item. | Giá trị được hỗ trợ: in stock; out of stock',
  '# Bắt buộc | The current condition of the item. | Giá trị được hỗ trợ: new; used',
  '# Bắt buộc | The price of the item. Format the price as a number followed by the 3-letter currency code.',
  '# Bắt buộc | The URL of the specific product page where people can buy the item.',
  '# Bắt buộc | The URL for the main image of your item.',
  '# Bắt buộc | Tên thương hiệu của mặt hàng.',
  '# Không bắt buộc | The Google product category for the item.',
  '# Không bắt buộc | The Facebook product category for the item.',
  '# Không bắt buộc | The quantity of this item you have to sell on Facebook and Instagram with checkout.',
  '# Không bắt buộc | The discounted price of the item if on sale.',
  '# Không bắt buộc | The time range for your sale period.',
  '# Không bắt buộc | Use this field to create variants of the same item.',
  '# Không bắt buộc | Giới tính. | Giá trị được hỗ trợ: female; male; unisex',
  '# Không bắt buộc | The color of the item.',
  '# Không bắt buộc | The size of the item.',
  '# Không bắt buộc | Nhóm tuổi. | Giá trị được hỗ trợ: adult; all ages; kids; teen',
  '# Không bắt buộc | Chất liệu của mặt hàng.',
  '# Không bắt buộc | The pattern or graphic print on the item.',
  '# Không bắt buộc | Thông tin vận chuyển.',
  '# Không bắt buộc | The shipping weight of the item.',
  '# Không bắt buộc | URL video sản phẩm.',
  '# Không bắt buộc | Tag video sản phẩm.',
  '# Không bắt buộc | Mã GTIN.',
  '# Không bắt buộc | Product tag 0.',
  '# Không bắt buộc | Product tag 1.',
  '# Không bắt buộc | Phong cách thời trang.',
].join(',');

const FIELD_NAMES = 'id,title,description,availability,condition,price,link,image_link,brand,google_product_category,fb_product_category,quantity_to_sell_on_facebook,sale_price,sale_price_effective_date,item_group_id,gender,color,size,age_group,material,pattern,shipping,shipping_weight,video[0].url,video[0].tag[0],gtin,product_tags[0],product_tags[1],style[0]';
const FIELD_ORDER = FIELD_NAMES.split(',');

// ── Helpers ──

function csvEscape(val: string | number | null | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function cleanDescription(desc: string | null): string {
  if (!desc) return '';
  return desc
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/<[^>]*>/g, '')
    .replace(/^•\s*/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 9999);
}

function mapGender(g: string | null): string {
  if (!g) return 'unisex';
  switch (g) {
    case 'MALE': return 'male';
    case 'FEMALE': return 'female';
    case 'KIDS': return 'unisex';
    default: return 'unisex';
  }
}

function mapMaterial(m: string | null): string {
  if (!m) return '';
  const map: Record<string, string> = {
    TITANIUM: 'Titanium', TR90: 'TR90', ACETATE: 'Acetate',
    METAL: 'Metal', MIXED: 'Mixed', WOOD: 'Wood', PLASTIC: 'Plastic',
  };
  return map[m] || m;
}

function mapFrameShape(s: string | null): string {
  if (!s) return '';
  const map: Record<string, string> = {
    SQUARE: 'vuong', ROUND: 'tron', OVAL: 'oval',
    CAT_EYE: 'cat-eye', AVIATOR: 'aviator', RECTANGLE: 'rectangle',
    GEOMETRIC: 'geometric', BROWLINE: 'browline',
  };
  return map[s] || '';
}

function priceLabel(price: number): string {
  if (price < 300000) return 'duoi-300k';
  if (price <= 500000) return '300k-500k';
  if (price <= 1000000) return '500k-1tr';
  return 'tren-1tr';
}

function extractProductType(name: string, slug: string, category: string | null): string {
  const lower = (name + ' ' + slug + ' ' + (category || '')).toLowerCase();
  if (lower.includes('kính mát') || lower.includes('kinh-mat') || lower.includes('sunglasses') || lower.includes('kính râm')) return 'kinh-mat';
  if (lower.includes('tròng kính') || lower.includes('trong-kinh') || lower.includes('lens')) return 'trong-kinh';
  return 'gong-kinh';
}

export async function GET(req: NextRequest) {
  const authError = requireAdmin(req, 'products');
  if (authError) return authError;

  try {
    const products = await db.product.findMany({
      where: {
        status: { in: ['ACTIVE', 'DRAFT'] },
      },
      include: {
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        media: { orderBy: { sort: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const rows: string[] = [];
    let exportedCount = 0;
    let skippedCount = 0;
    const skippedReasons: string[] = [];

    for (const p of products) {
      // Skip products with no variants / no price
      const mainVariant = p.variants[0];
      if (!mainVariant || mainVariant.price <= 0) {
        skippedCount++;
        skippedReasons.push(`${p.name}: Không có giá`);
        continue;
      }

      // Skip products with no image
      const mainImage = p.media.find((m: { type: string }) => m.type === 'IMAGE');
      if (!mainImage) {
        skippedCount++;
        skippedReasons.push(`${p.name}: Không có ảnh`);
        continue;
      }

      // Determine pricing — if compareAtPrice > price, use compareAt as list price and price as sale
      const hasDiscount = mainVariant.compareAtPrice && mainVariant.compareAtPrice > mainVariant.price;
      const listPrice = hasDiscount ? mainVariant.compareAtPrice! : mainVariant.price;
      const salePrice = hasDiscount ? mainVariant.price : null;

      // Get video URLs
      const videos = p.media.filter((m: { type: string }) => m.type === 'VIDEO');

      // Stock
      const totalStock = p.variants.reduce((s: number, v: { stockQty: number }) => s + v.stockQty, 0);

      // Availability
      const availability = (p.status === 'ACTIVE' && totalStock > 0) ? 'in stock' : 'out of stock';

      // Build the image URL
      const imageUrl = mainImage.url.startsWith('http') ? mainImage.url : `${SITE_URL}${mainImage.url.startsWith('/') ? '' : '/'}${mainImage.url}`;

      // Generate one row per variant (if multiple variants with different colors/sizes)
      // Or one row if single variant
      if (p.variants.length <= 1) {
        const row: Record<string, string> = {
          id: p.slug,
          title: p.name.substring(0, 200),
          description: cleanDescription(p.description),
          availability,
          condition: 'new',
          price: `${listPrice} VND`,
          link: `${SITE_URL}/p/${p.slug}`,
          image_link: imageUrl,
          brand: p.brand || DEFAULT_BRAND,
          google_product_category: GOOGLE_CATEGORY,
          fb_product_category: '',
          quantity_to_sell_on_facebook: totalStock > 0 ? String(totalStock) : '',
          sale_price: salePrice ? `${salePrice} VND` : '',
          sale_price_effective_date: '',
          item_group_id: '',
          gender: mapGender(p.gender),
          color: mainVariant.frameColor || '',
          size: mainVariant.size || '',
          age_group: 'adult',
          material: mapMaterial(p.material),
          pattern: '',
          shipping: '',
          shipping_weight: p.weight ? `${p.weight} g` : '',
          'video[0].url': videos[0] ? (videos[0].url.startsWith('http') ? videos[0].url : `${SITE_URL}${videos[0].url}`) : '',
          'video[0].tag[0]': '',
          gtin: '',
          'product_tags[0]': extractProductType(p.name, p.slug, p.category),
          'product_tags[1]': priceLabel(mainVariant.price),
          'style[0]': mapFrameShape(p.frameShape),
        };
        rows.push(FIELD_ORDER.map(f => csvEscape(row[f])).join(','));
        exportedCount++;
      } else {
        // Multiple variants — each gets its own row with item_group_id
        for (const v of p.variants) {
          if (v.price <= 0) continue;
          const vHasDiscount = v.compareAtPrice && v.compareAtPrice > v.price;
          const vListPrice = vHasDiscount ? v.compareAtPrice! : v.price;
          const vSalePrice = vHasDiscount ? v.price : null;

          // Find variant-specific image or use product main image
          const vImage = p.media.find((m: { variantId: string | null; type: string }) => m.variantId === v.id && m.type === 'IMAGE');
          const vImgUrl = vImage ? (vImage.url.startsWith('http') ? vImage.url : `${SITE_URL}${vImage.url}`) : imageUrl;

          const row: Record<string, string> = {
            id: v.sku || `${p.slug}-${v.frameColor}`,
            title: `${p.name} - ${v.frameColor}${v.size ? ` (${v.size})` : ''}`.substring(0, 200),
            description: cleanDescription(p.description),
            availability: v.stockQty > 0 ? 'in stock' : 'out of stock',
            condition: 'new',
            price: `${vListPrice} VND`,
            link: `${SITE_URL}/p/${p.slug}`,
            image_link: vImgUrl,
            brand: p.brand || DEFAULT_BRAND,
            google_product_category: GOOGLE_CATEGORY,
            fb_product_category: '',
            quantity_to_sell_on_facebook: v.stockQty > 0 ? String(v.stockQty) : '',
            sale_price: vSalePrice ? `${vSalePrice} VND` : '',
            sale_price_effective_date: '',
            item_group_id: p.slug,
            gender: mapGender(p.gender),
            color: v.frameColor || '',
            size: v.size || '',
            age_group: 'adult',
            material: mapMaterial(v.material || p.material),
            pattern: '',
            shipping: '',
            shipping_weight: (v.weight || p.weight) ? `${v.weight || p.weight} g` : '',
            'video[0].url': videos[0] ? (videos[0].url.startsWith('http') ? videos[0].url : `${SITE_URL}${videos[0].url}`) : '',
            'video[0].tag[0]': '',
            gtin: '',
            'product_tags[0]': extractProductType(p.name, p.slug, p.category),
            'product_tags[1]': priceLabel(v.price),
            'style[0]': mapFrameShape(p.frameShape),
          };
          rows.push(FIELD_ORDER.map(f => csvEscape(row[f])).join(','));
          exportedCount++;
        }
      }
    }

    // Build CSV with BOM for Excel UTF-8 compatibility
    const BOM = '\ufeff';
    const csv = BOM + DESCRIPTIVE_HEADER + '\n' + FIELD_NAMES + '\n' + rows.join('\n') + '\n';

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="smk_meta_catalog_export.csv"`,
        'X-Export-Count': String(exportedCount),
        'X-Skipped-Count': String(skippedCount),
      },
    });
  } catch (err) {
    console.error('[meta-export] Error:', err);
    return NextResponse.json(
      { error: 'Lỗi xuất catalog', detail: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
