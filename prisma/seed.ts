import { PrismaClient, PartnerLevel, CommScope, CouponType, PaymentMethod } from '@prisma/client';
const prisma = new PrismaClient();

/* ═══════════════════ HELPERS ═══════════════════ */
const hash = '$2b$10$xnJ0KFvzZzptDWQ0Pncvpu/EErjBzklzkQB2EQWaAD8Bi62T8JMmC'; // "admin123"

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }
function dateBefore(daysAgo: number) { return new Date(Date.now() - daysAgo * 86400000); }

/* ═══════════════════ CONSTANTS ═══════════════════ */
const BRANDS = ['Ray-Ban', 'Tom Ford', 'Oakley', 'Gucci', 'Lindberg'];
const SHAPES = ['AVIATOR', 'CAT_EYE', 'ROUND', 'SQUARE', 'BROWLINE', 'OVAL', 'GEOMETRIC', 'RECTANGLE'] as const;
const MATS = ['METAL', 'ACETATE', 'TITANIUM', 'TR90', 'MIXED'] as const;
const GENDERS = ['MALE', 'FEMALE', 'UNISEX'] as const;
const FACES = ['Mặt tròn', 'Mặt vuông', 'Mặt dài', 'Oval', 'Trái tim'];
const STYLES = ['Sang trọng', 'Basic', 'Công sở', 'Thể thao', 'Retro', 'Cá tính'];
const COLORS = ['Đen', 'Vàng', 'Bạc', 'Hồng', 'Xanh navy', 'Tortoise', 'Gunmetal', 'Vàng hồng', 'Đồi mồi', 'Trong suốt'];
const LENS_COLORS = ['Xám', 'Nâu', 'Xanh lá', 'Xanh dương', 'Trong suốt'];
const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'PAID', 'SHIPPING', 'DELIVERED', 'RETURNED', 'CANCELLED'] as const;

// Product templates for 30 products
const PRODUCT_TEMPLATES = [
    { name: 'Aviator Classic Gold', shape: 0, mat: 0, brand: 0, price: 2990000 },
    { name: 'Cat-Eye Acetate Tortoise', shape: 1, mat: 1, brand: 1, price: 4590000 },
    { name: 'Round Titanium Silver', shape: 2, mat: 2, brand: 4, price: 8990000 },
    { name: 'Square TR90 Black', shape: 3, mat: 3, brand: 2, price: 3290000 },
    { name: 'Browline Mixed Gold-Black', shape: 4, mat: 4, brand: 3, price: 5490000 },
    { name: 'Oval Crystal Pink', shape: 5, mat: 1, brand: 3, price: 6790000 },
    { name: 'Geometric Titanium Rose', shape: 6, mat: 2, brand: 1, price: 7290000 },
    { name: 'Rectangle Metal Gunmetal', shape: 7, mat: 0, brand: 2, price: 2490000 },
    { name: 'Aviator Polarized Black', shape: 0, mat: 0, brand: 0, price: 3490000 },
    { name: 'Cat-Eye Retro Blue', shape: 1, mat: 1, brand: 3, price: 5290000 },
    { name: 'Round Wire Gold', shape: 2, mat: 0, brand: 4, price: 9590000 },
    { name: 'Square Sport Navy', shape: 3, mat: 3, brand: 2, price: 2890000 },
    { name: 'Browline Classic Havana', shape: 4, mat: 4, brand: 0, price: 4190000 },
    { name: 'Oval Acetate Emerald', shape: 5, mat: 1, brand: 3, price: 7490000 },
    { name: 'Geometric Bold Orange', shape: 6, mat: 1, brand: 1, price: 6390000 },
    { name: 'Rectangle Titanium Slate', shape: 7, mat: 2, brand: 4, price: 8290000 },
    { name: 'Aviator Gradient Sunset', shape: 0, mat: 0, brand: 0, price: 3290000 },
    { name: 'Cat-Eye Oversized Crystal', shape: 1, mat: 1, brand: 1, price: 5890000 },
    { name: 'Round Vintage Bronze', shape: 2, mat: 0, brand: 0, price: 3990000 },
    { name: 'Square Acetate Marble', shape: 3, mat: 1, brand: 3, price: 4790000 },
    { name: 'Browline Titanium Grey', shape: 4, mat: 2, brand: 4, price: 7690000 },
    { name: 'Oval Thin Wire Rose', shape: 5, mat: 0, brand: 4, price: 8490000 },
    { name: 'Geometric TR90 Red', shape: 6, mat: 3, brand: 2, price: 2690000 },
    { name: 'Rectangle Acetate Havana', shape: 7, mat: 1, brand: 0, price: 3590000 },
    { name: 'Aviator Mini Unisex', shape: 0, mat: 0, brand: 0, price: 2490000 },
    { name: 'Cat-Eye Pearl White', shape: 1, mat: 1, brand: 3, price: 6290000 },
    { name: 'Round Kids Blue', shape: 2, mat: 3, brand: 2, price: 1490000 },
    { name: 'Square Oversized Bold', shape: 3, mat: 1, brand: 1, price: 5990000 },
    { name: 'Browline Sport Carbon', shape: 4, mat: 3, brand: 2, price: 3190000 },
    { name: 'Oval Luxury Diamond', shape: 5, mat: 2, brand: 3, price: 12990000 },
];

async function main() {
    console.log('🌱 Seeding database (full E2E dataset)...\n');

    /* ─── 1. Admin / Manager / Staff ─── */
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@sieuthimatkinh.vn' },
        update: { password: hash },
        create: { email: 'admin@sieuthimatkinh.vn', phone: '0900000000', name: 'Admin SMK', role: 'ADMIN', password: hash },
    });
    const managerUser = await prisma.user.upsert({
        where: { email: 'manager@sieuthimatkinh.vn' },
        update: { password: hash },
        create: { email: 'manager@sieuthimatkinh.vn', phone: '0900000001', name: 'Store Manager', role: 'STORE_MANAGER', password: hash, permissions: ['products', 'orders', 'customers', 'shipping', 'returns', 'warehouse', 'reviews'] },
    });
    const staffUser = await prisma.user.upsert({
        where: { email: 'staff@sieuthimatkinh.vn' },
        update: { password: hash },
        create: { email: 'staff@sieuthimatkinh.vn', phone: '0900000002', name: 'Staff Member', role: 'STAFF', password: hash, permissions: ['orders', 'customers', 'support'] },
    });
    console.log('  ✓ 3 admin accounts (Admin, Manager, Staff)');

    /* ─── 2. 20 Customers ─── */
    const customerNames = [
        'Nguyễn Văn Khách', 'Trần Thị Mai', 'Lê Hoàng', 'Phạm Minh', 'Võ Thanh',
        'Đỗ Lan', 'Hồ Anh', 'Bùi Trang', 'Đặng Huy', 'Ngô Thu',
        'Lý Bảo', 'Phan Linh', 'Huỳnh Đức', 'Vũ Hà', 'Đinh Sơn',
        'Trương Yến', 'Lưu Quang', 'Dương Vy', 'Tạ Thắng', 'Mai Hương',
    ];
    const customers = [];
    for (let i = 0; i < 20; i++) {
        const c = await prisma.user.upsert({
            where: { email: `customer${i + 1}@example.com` },
            update: {},
            create: {
                email: `customer${i + 1}@example.com`,
                phone: `09${String(10000000 + i).padStart(8, '0')}`,
                name: customerNames[i],
                role: 'CUSTOMER',
            },
        });
        customers.push(c);
    }
    console.log('  ✓ 20 customers');

    /* ─── 3. 10 Partners ─── */
    const partnerDefs: { code: string; name: string; level: PartnerLevel }[] = [
        { code: 'AFF_001', name: 'Ngọc Affiliate', level: PartnerLevel.AFFILIATE },
        { code: 'AFF_002', name: 'Minh Creator', level: PartnerLevel.AFFILIATE },
        { code: 'AFF_003', name: 'Lan KOL', level: PartnerLevel.AFFILIATE },
        { code: 'AFF_004', name: 'Huy Blogger', level: PartnerLevel.AFFILIATE },
        { code: 'AGT_001', name: 'Đại lý Duy', level: PartnerLevel.AGENT },
        { code: 'AGT_002', name: 'Đại lý Thảo', level: PartnerLevel.AGENT },
        { code: 'AGT_003', name: 'Đại lý Bình', level: PartnerLevel.AGENT },
        { code: 'AGT_004', name: 'Đại lý Hải', level: PartnerLevel.AGENT },
        { code: 'LDR_001', name: 'Shop Hà Nội', level: PartnerLevel.LEADER },
        { code: 'LDR_002', name: 'Shop Sài Gòn', level: PartnerLevel.LEADER },
    ];
    const partners = [];
    for (const pd of partnerDefs) {
        const pu = await prisma.user.upsert({
            where: { email: `${pd.code.toLowerCase()}@partner.com` },
            update: {},
            create: { email: `${pd.code.toLowerCase()}@partner.com`, phone: `098${randInt(1000000, 9999999)}`, name: pd.name, role: 'PARTNER' },
        });
        const pp = await prisma.partnerProfile.upsert({
            where: { userId: pu.id },
            update: {},
            create: {
                userId: pu.id,
                partnerCode: pd.code,
                level: pd.level,
                status: 'ACTIVE',
                bankAccount: { bank: 'Vietcombank', accountNumber: `${randInt(100000, 999999)}`, accountName: pd.name.toUpperCase() },
                storeName: `Kính ${pd.name.split(' ').pop()}`,
            },
        });
        partners.push(pp);
    }
    console.log('  ✓ 10 partners (4 Affiliate, 4 Agent, 2 Leader)');

    /* ─── 4. Commission Rules (per level) ─── */
    const commRules: [CommScope, number][] = [[CommScope.GLOBAL, 5], [CommScope.CATEGORY, 5], [CommScope.PRODUCT, 8], [CommScope.GLOBAL, 12]];
    const ruleNames = ['GLOBAL', 'AFFILIATE', 'AGENT', 'LEADER'];
    for (let ri = 0; ri < commRules.length; ri++) {
        const [scope, percent] = commRules[ri];
        await prisma.commissionRule.upsert({
            where: { id: `rule-${ruleNames[ri]}` },
            update: { percent },
            create: { id: `rule-${ruleNames[ri]}`, scope, percent },
        });
    }
    console.log('  ✓ Commission rules (Affiliate 5%, Agent 8%, Leader 12%)');

    /* ─── 5. 10 Coupons ─── */
    const couponDefs: { code: string; type: CouponType; value: number; ownerPartnerId: string | null }[] = [
        { code: 'WELCOME10', type: CouponType.PERCENT, value: 10, ownerPartnerId: null },
        { code: 'FLAT50K', type: CouponType.FIXED, value: 50000, ownerPartnerId: null },
        { code: 'SUMMER20', type: CouponType.PERCENT, value: 20, ownerPartnerId: null },
        { code: 'FREESHIP', type: CouponType.FIXED, value: 30000, ownerPartnerId: null },
        { code: 'VIP15', type: CouponType.PERCENT, value: 15, ownerPartnerId: null },
        // Partner coupons
        { code: 'DUY10', type: CouponType.PERCENT, value: 10, ownerPartnerId: partners[4].id },
        { code: 'THAO8', type: CouponType.PERCENT, value: 8, ownerPartnerId: partners[5].id },
        { code: 'BINH5', type: CouponType.PERCENT, value: 5, ownerPartnerId: partners[6].id },
        { code: 'HANOI12', type: CouponType.PERCENT, value: 12, ownerPartnerId: partners[8].id },
        { code: 'SAIGON10', type: CouponType.PERCENT, value: 10, ownerPartnerId: partners[9].id },
    ];
    for (const cp of couponDefs) {
        await prisma.coupon.upsert({
            where: { code: cp.code },
            update: {},
            create: {
                code: cp.code,
                type: cp.type,
                value: cp.value,
                ownerPartnerId: cp.ownerPartnerId,
                startsAt: new Date('2026-01-01'),
                endsAt: new Date('2027-12-31'),
                isActive: true,
            },
        });
    }
    console.log('  ✓ 10 coupons (5 global + 5 partner)');

    /* ─── 6. 30 Products ─── */
    const productIds: string[] = [];
    const variantIds: string[] = [];
    for (let i = 0; i < PRODUCT_TEMPLATES.length; i++) {
        const t = PRODUCT_TEMPLATES[i];
        const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const brand = BRANDS[t.brand];
        const shape = SHAPES[t.shape];
        const mat = MATS[t.mat % MATS.length];
        const gender = GENDERS[i % GENDERS.length];

        const variantCount = i < 8 ? 2 + (i % 2) : 1 + (i % 3);
        const variants = [];
        for (let v = 0; v < variantCount; v++) {
            variants.push({
                sku: `${brand.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}-V${v + 1}`,
                frameColor: COLORS[(i + v) % COLORS.length],
                lensColor: LENS_COLORS[v % LENS_COLORS.length],
                price: t.price + v * 200000,
                compareAtPrice: v === 0 ? Math.round(t.price * 1.2) : undefined,
                stockQty: randInt(2, 30),
            });
        }

        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                name: t.name,
                slug,
                brand,
                description: `Gọng kính ${t.name} cao cấp từ ${brand}. Chất liệu ${mat}, kiểu dáng ${shape}.`,
                frameShape: shape,
                material: mat,
                faceShape: [pick(FACES), pick(FACES)],
                style: [pick(STYLES), pick(STYLES)],
                gender,
                lensWidth: randInt(48, 58),
                bridge: randInt(14, 20),
                templeLength: randInt(135, 150),
                tags: [brand.toLowerCase(), shape.toLowerCase(), mat.toLowerCase()],
                status: i < 28 ? 'ACTIVE' : 'DRAFT',
                variants: { create: variants },
            },
            include: { variants: true },
        });
        productIds.push(product.id);
        product.variants.forEach((v: { id: string }) => variantIds.push(v.id));
    }
    console.log(`  ✓ 30 products (${variantIds.length} variants)`);

    /* ─── 7. Collections ─── */
    const collections = [
        { name: 'Kính Cận', slug: 'kinh-can', sort: 1 },
        { name: 'Kính Râm', slug: 'kinh-ram', sort: 2 },
        { name: 'Gọng Nam', slug: 'gong-kinh-nam', sort: 3 },
        { name: 'Gọng Nữ', slug: 'gong-kinh-nu', sort: 4 },
        { name: 'Tròng Kính', slug: 'trong-kinh', sort: 5 },
        { name: 'Phụ Kiện', slug: 'phu-kien', sort: 6 },
        { name: 'Xu hướng', slug: 'trending', sort: 7 },
        { name: 'Bán chạy', slug: 'best-sellers', sort: 8 },
        { name: 'Mới về', slug: 'new-arrivals', sort: 9 },
    ];
    for (const c of collections) {
        await prisma.collection.upsert({ where: { slug: c.slug }, update: {}, create: c });
    }
    console.log('  ✓ 9 collections');

    /* ─── 8. 50 Orders ─── */
    const statusWeights = [5, 5, 3, 8, 20, 5, 4]; // distribution across statuses
    let orderIndex = 0;
    for (let s = 0; s < ORDER_STATUSES.length; s++) {
        const count = statusWeights[s];
        for (let j = 0; j < count; j++) {
            orderIndex++;
            const cust = pick(customers);
            const partner = Math.random() > 0.4 ? pick(partners) : null;
            const variant = pick(variantIds);
            const qty = randInt(1, 3);
            const itemPrice = PRODUCT_TEMPLATES[orderIndex % PRODUCT_TEMPLATES.length].price;
            const total = itemPrice * qty;
            const status = ORDER_STATUSES[s];
            const daysAgo = randInt(1, 30);

            const shippingFee = total >= 500000 ? 0 : 30000;
            const order = await prisma.order.create({
                data: {
                    code: `SMK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(orderIndex).padStart(4, '0')}`,
                    userId: cust.id,
                    status,
                    subtotal: total,
                    total: total + shippingFee,
                    shippingFee,
                    shippingAddress: { name: cust.name, phone: cust.phone || '', address: `${randInt(1, 200)} Nguyễn Huệ, Q1, HCM` },
                    paymentMethod: pick([PaymentMethod.COD, PaymentMethod.BANK_TRANSFER, PaymentMethod.MOMO, PaymentMethod.ZALOPAY]),
                    deliveredAt: status === 'DELIVERED' ? dateBefore(daysAgo) : null,
                    createdAt: dateBefore(daysAgo + randInt(0, 5)),
                    items: {
                        create: [{
                            variantId: variant,
                            qty,
                            price: itemPrice,
                            nameSnapshot: PRODUCT_TEMPLATES[orderIndex % PRODUCT_TEMPLATES.length].name,
                            skuSnapshot: `SKU-${String(orderIndex).padStart(4, '0')}`,
                        }],
                    },
                },
            });

            // Create OrderReferral for partner attribution
            if (partner) {
                await prisma.orderReferral.create({
                    data: {
                        orderId: order.id,
                        partnerId: partner.id,
                        attributionType: Math.random() > 0.5 ? 'COUPON' : 'LAST_CLICK',
                    },
                });
            }

            // Create commission for partner orders with DELIVERED status
            if (partner && status === 'DELIVERED') {
                const levelPercent = partner.level === 'LEADER' ? 12 : partner.level === 'AGENT' ? 8 : 5;
                await prisma.commission.create({
                    data: {
                        orderId: order.id,
                        partnerId: partner.id,
                        amount: Math.round(total * levelPercent / 100),
                        status: Math.random() > 0.3 ? 'AVAILABLE' : 'PENDING',
                        holdUntil: dateBefore(-14), // 14 days from now
                    },
                });
            }
        }
    }
    console.log(`  ✓ 50 orders across all statuses`);

    console.log('\n✅ Full E2E seed complete!');
    console.log(`   📦 30 products · 👥 20 customers · 🤝 10 partners · 🛒 50 orders · 🎫 10 coupons · 👔 3 admins\n`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
