import { PrismaClient, PartnerLevel, CommScope, CouponType, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

/**
 * ═══════════════════════════════════════════════════════════
 *  SMK — Full Feature Test Data Seed
 *  All test data is marked with TEST_ prefix or test-data tag
 *  Run cleanup() to remove all test data cleanly
 * ═══════════════════════════════════════════════════════════
 */

const TEST_PREFIX = 'TEST_';
const TEST_TAG = 'test-data';

/* ═══ HELPERS ═══ */
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }
function dateBefore(daysAgo: number) { return new Date(Date.now() - daysAgo * 86400000); }
function dateAfter(daysAhead: number) { return new Date(Date.now() + daysAhead * 86400000); }
function tid(base: string) { return `${TEST_PREFIX}${base}`; }

/* ═══ CONSTANTS ═══ */
const BRANDS = ['Ray-Ban', 'Tom Ford', 'Oakley', 'Gucci', 'Lindberg'];
const SHAPES = ['AVIATOR', 'CAT_EYE', 'ROUND', 'SQUARE', 'BROWLINE', 'OVAL', 'GEOMETRIC', 'RECTANGLE'] as const;
const MATS = ['METAL', 'ACETATE', 'TITANIUM', 'TR90', 'MIXED'] as const;
const GENDERS = ['MALE', 'FEMALE', 'UNISEX'] as const;
const FACES = ['Mặt tròn', 'Mặt vuông', 'Mặt dài', 'Oval', 'Trái tim'];
const STYLES_ARR = ['Sang trọng', 'Basic', 'Công sở', 'Thể thao', 'Retro', 'Cá tính'];
const COLORS = ['Đen', 'Vàng', 'Bạc', 'Hồng', 'Xanh navy', 'Tortoise', 'Gunmetal', 'Vàng hồng'];
const LENS_COLORS = ['Xám', 'Nâu', 'Xanh lá', 'Xanh dương', 'Trong suốt'];
const ORDER_STATUSES = ['CREATED', 'CONFIRMED', 'PAID', 'SHIPPING', 'DELIVERED', 'RETURNED', 'CANCELLED'] as const;
const PROVINCES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'];
const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 7', 'Bình Thạnh', 'Tân Bình'];
const REVIEW_COMMENTS = [
    'Kính rất đẹp, đúng hình mô tả!',
    'Chất lượng tốt, giao hàng nhanh.',
    'Gọng nhẹ, đeo thoải mái cả ngày.',
    'Giá tốt so với thị trường.',
    'Đóng gói cẩn thận, kính đẹp lắm.',
    'Mua tặng người thân, rất hài lòng.',
    'Đã mua lần 2, vẫn tin tưởng shop.',
    'Kính hơi lỏng, nhưng shop hỗ trợ chỉnh ngay.',
    'Lens trong, nhìn rõ, không bị mờ.',
    'Phong cách đẹp, nhiều người khen.',
];
const QUESTIONS = [
    'Kính này có phù hợp mặt tròn không?',
    'Có bảo hành bao lâu ạ?',
    'Gọng này có đổi màu khác được không?',
    'Có thể lắp tròng cận vào kính này không?',
    'Ship về Đà Nẵng mất mấy ngày ạ?',
    'Đang giảm giá không shop ơi?',
    'Kính này unisex đúng không ạ?',
    'Có nhận bảo hành gọng gãy không?',
];

const PRODUCT_TEMPLATES = [
    { name: 'TEST Aviator Classic Gold', shape: 0, mat: 0, brand: 0, price: 2990000 },
    { name: 'TEST Cat-Eye Acetate Tortoise', shape: 1, mat: 1, brand: 1, price: 4590000 },
    { name: 'TEST Round Titanium Silver', shape: 2, mat: 2, brand: 4, price: 8990000 },
    { name: 'TEST Square TR90 Black', shape: 3, mat: 3, brand: 2, price: 3290000 },
    { name: 'TEST Browline Mixed Gold', shape: 4, mat: 4, brand: 3, price: 5490000 },
    { name: 'TEST Oval Crystal Pink', shape: 5, mat: 1, brand: 3, price: 6790000 },
    { name: 'TEST Geometric Titanium Rose', shape: 6, mat: 2, brand: 1, price: 7290000 },
    { name: 'TEST Rectangle Metal Gunmetal', shape: 7, mat: 0, brand: 2, price: 2490000 },
    { name: 'TEST Aviator Polarized Black', shape: 0, mat: 0, brand: 0, price: 3490000 },
    { name: 'TEST Cat-Eye Retro Blue', shape: 1, mat: 1, brand: 3, price: 5290000 },
    { name: 'TEST Round Wire Gold', shape: 2, mat: 0, brand: 4, price: 9590000 },
    { name: 'TEST Square Sport Navy', shape: 3, mat: 3, brand: 2, price: 2890000 },
    { name: 'TEST Browline Classic Havana', shape: 4, mat: 4, brand: 0, price: 4190000 },
    { name: 'TEST Oval Acetate Emerald', shape: 5, mat: 1, brand: 3, price: 7490000 },
    { name: 'TEST Geometric Bold Orange', shape: 6, mat: 1, brand: 1, price: 6390000 },
    { name: 'TEST Rectangle Titanium Slate', shape: 7, mat: 2, brand: 4, price: 8290000 },
    { name: 'TEST Aviator Gradient Sunset', shape: 0, mat: 0, brand: 0, price: 3290000 },
    { name: 'TEST Cat-Eye Oversized Crystal', shape: 1, mat: 1, brand: 1, price: 5890000 },
    { name: 'TEST Round Vintage Bronze', shape: 2, mat: 0, brand: 0, price: 3990000 },
    { name: 'TEST Square Acetate Marble', shape: 3, mat: 1, brand: 3, price: 4790000 },
    { name: 'TEST Browline Titanium Grey', shape: 4, mat: 2, brand: 4, price: 7690000 },
    { name: 'TEST Oval Thin Wire Rose', shape: 5, mat: 0, brand: 4, price: 8490000 },
    { name: 'TEST Geometric TR90 Red', shape: 6, mat: 3, brand: 2, price: 2690000 },
    { name: 'TEST Rectangle Acetate Havana', shape: 7, mat: 1, brand: 0, price: 3590000 },
    { name: 'TEST Aviator Mini Unisex', shape: 0, mat: 0, brand: 0, price: 2490000 },
    { name: 'TEST Cat-Eye Pearl White', shape: 1, mat: 1, brand: 3, price: 6290000 },
    { name: 'TEST Round Kids Blue', shape: 2, mat: 3, brand: 2, price: 1490000 },
    { name: 'TEST Square Oversized Bold', shape: 3, mat: 1, brand: 1, price: 5990000 },
    { name: 'TEST Browline Sport Carbon', shape: 4, mat: 3, brand: 2, price: 3190000 },
    { name: 'TEST Oval Luxury Diamond', shape: 5, mat: 2, brand: 3, price: 12990000 },
];

/* ═══════════════════ MAIN SEED ═══════════════════ */
async function main() {
    console.log('🌱 SMK FULL TEST DATA SEED');
    console.log('   All test data marked with TEST_ prefix for cleanup\n');

    /* ─── 1. ADMIN USER (permanent — NOT test data) ─── */
    const adminHash = await bcrypt.hash('Nguyendinhduy@95', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'nguyendinhduy@sieuthimatkinh.vn' },
        update: { password: adminHash, role: 'ADMIN', name: 'Nguyễn Đình Duy' },
        create: {
            id: 'admin_nguyendinhduy',
            email: 'nguyendinhduy@sieuthimatkinh.vn',
            phone: '0900000001',
            name: 'Nguyễn Đình Duy',
            role: 'ADMIN',
            password: adminHash
        },
    });
    console.log('  ✓ Admin: nguyendinhduy@sieuthimatkinh.vn / Nguyendinhduy@95');

    /* ─── 2. Test Staff (manager + staff) ─── */
    const testHash = await bcrypt.hash('Test@12345', 10);
    const managerUser = await prisma.user.upsert({
        where: { email: 'test.manager@sieuthimatkinh.vn' },
        update: {},
        create: { id: tid('manager'), email: 'test.manager@sieuthimatkinh.vn', phone: '0900100001', name: '[TEST] Store Manager', role: 'STORE_MANAGER', password: testHash, permissions: ['products', 'orders', 'customers', 'shipping', 'returns', 'warehouse', 'reviews'] },
    });
    const staffUser = await prisma.user.upsert({
        where: { email: 'test.staff@sieuthimatkinh.vn' },
        update: {},
        create: { id: tid('staff'), email: 'test.staff@sieuthimatkinh.vn', phone: '0900100002', name: '[TEST] Staff Member', role: 'STAFF', password: testHash, permissions: ['orders', 'customers', 'support'] },
    });
    console.log('  ✓ Test Manager + Staff (password: Test@12345)');

    /* ─── 3. 20 Test Customers ─── */
    const customerNames = [
        'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Hoàng Long', 'Phạm Minh Tuấn', 'Võ Thanh Hà',
        'Đỗ Thuý Lan', 'Hồ Quốc Anh', 'Bùi Kim Trang', 'Đặng Quang Huy', 'Ngô Ánh Thu',
        'Lý Bảo Khánh', 'Phan Ngọc Linh', 'Huỳnh Minh Đức', 'Vũ Thu Hà', 'Đinh Văn Sơn',
        'Trương Thuỳ Yến', 'Lưu Quang Minh', 'Dương Tường Vy', 'Tạ Anh Thắng', 'Mai Hương Giang',
    ];
    const customers = [];
    for (let i = 0; i < 20; i++) {
        const c = await prisma.user.upsert({
            where: { email: `test.customer${i + 1}@example.com` },
            update: {},
            create: {
                id: tid(`customer_${i + 1}`),
                email: `test.customer${i + 1}@example.com`,
                phone: `098${String(10000000 + i).padStart(8, '0')}`,
                name: `[TEST] ${customerNames[i]}`,
                role: 'CUSTOMER',
                password: testHash,
            },
        });
        customers.push(c);
    }
    console.log('  ✓ 20 test customers');

    /* ─── 4. Addresses for customers ─── */
    for (let i = 0; i < 20; i++) {
        await prisma.address.upsert({
            where: { id: tid(`addr_${i + 1}`) },
            update: {},
            create: {
                id: tid(`addr_${i + 1}`),
                userId: customers[i].id,
                name: customers[i].name || 'Khách hàng',
                phone: customers[i].phone || '0900000000',
                province: pick(PROVINCES),
                district: pick(DISTRICTS),
                ward: `Phường ${randInt(1, 15)}`,
                street: `${randInt(1, 200)} Đường ${pick(['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Hai Bà Trưng', 'Điện Biên Phủ'])}`,
                isDefault: true,
            },
        });
    }
    console.log('  ✓ 20 addresses');

    /* ─── 5. 10 Test Partners ─── */
    const partnerDefs: { code: string; name: string; level: PartnerLevel }[] = [
        { code: 'TAFF001', name: '[TEST] Ngọc Affiliate', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF002', name: '[TEST] Minh Creator', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF003', name: '[TEST] Lan KOL', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF004', name: '[TEST] Huy Blogger', level: PartnerLevel.AFFILIATE },
        { code: 'TAGT001', name: '[TEST] Đại lý Duy', level: PartnerLevel.AGENT },
        { code: 'TAGT002', name: '[TEST] Đại lý Thảo', level: PartnerLevel.AGENT },
        { code: 'TAGT003', name: '[TEST] Đại lý Bình', level: PartnerLevel.AGENT },
        { code: 'TAGT004', name: '[TEST] Đại lý Hải', level: PartnerLevel.AGENT },
        { code: 'TLDR001', name: '[TEST] Shop Hà Nội', level: PartnerLevel.LEADER },
        { code: 'TLDR002', name: '[TEST] Shop Sài Gòn', level: PartnerLevel.LEADER },
    ];
    const partners = [];
    for (const pd of partnerDefs) {
        const pu = await prisma.user.upsert({
            where: { email: `${pd.code.toLowerCase()}@testpartner.com` },
            update: {},
            create: { id: tid(`partner_user_${pd.code}`), email: `${pd.code.toLowerCase()}@testpartner.com`, phone: `097${randInt(1000000, 9999999)}`, name: pd.name, role: 'PARTNER', password: testHash },
        });
        const pp = await prisma.partnerProfile.upsert({
            where: { userId: pu.id },
            update: {},
            create: {
                id: tid(`partner_${pd.code}`),
                userId: pu.id,
                partnerCode: pd.code,
                level: pd.level,
                status: 'ACTIVE',
                bankAccount: { bank: 'Vietcombank', accountNumber: `${randInt(100000, 999999)}`, accountName: pd.name.toUpperCase() },
                storeName: `[TEST] Kính ${pd.name.split(' ').pop()}`,
                balance: randInt(500000, 5000000),
            },
        });
        partners.push(pp);
    }
    console.log('  ✓ 10 test partners');

    /* ─── 6. Commission Rules ─── */
    const commRules: [CommScope, number][] = [[CommScope.GLOBAL, 5], [CommScope.CATEGORY, 5], [CommScope.PRODUCT, 8], [CommScope.GLOBAL, 12]];
    const ruleNames = ['TGLOBAL', 'TAFFILIATE', 'TAGENT', 'TLEADER'];
    for (let ri = 0; ri < commRules.length; ri++) {
        await prisma.commissionRule.upsert({
            where: { id: tid(`rule_${ruleNames[ri]}`) },
            update: {},
            create: { id: tid(`rule_${ruleNames[ri]}`), scope: commRules[ri][0], percent: commRules[ri][1] },
        });
    }
    console.log('  ✓ 4 commission rules');

    /* ─── 7. 10 Coupons ─── */
    const couponDefs: { code: string; type: CouponType; value: number; pid: string | null }[] = [
        { code: 'TWELCOME10', type: CouponType.PERCENT, value: 10, pid: null },
        { code: 'TFLAT50K', type: CouponType.FIXED, value: 50000, pid: null },
        { code: 'TSUMMER20', type: CouponType.PERCENT, value: 20, pid: null },
        { code: 'TFREESHIP', type: CouponType.FIXED, value: 30000, pid: null },
        { code: 'TVIP15', type: CouponType.PERCENT, value: 15, pid: null },
        { code: 'TDUY10', type: CouponType.PERCENT, value: 10, pid: partners[4].id },
        { code: 'TTHAO8', type: CouponType.PERCENT, value: 8, pid: partners[5].id },
        { code: 'TBINH5', type: CouponType.PERCENT, value: 5, pid: partners[6].id },
        { code: 'THANOI12', type: CouponType.PERCENT, value: 12, pid: partners[8].id },
        { code: 'TSAIGON10', type: CouponType.PERCENT, value: 10, pid: partners[9].id },
    ];
    for (const cp of couponDefs) {
        await prisma.coupon.upsert({
            where: { code: cp.code },
            update: {},
            create: { code: cp.code, type: cp.type, value: cp.value, ownerPartnerId: cp.pid, startsAt: new Date('2026-01-01'), endsAt: new Date('2027-12-31'), isActive: true },
        });
    }
    console.log('  ✓ 10 coupons');

    /* ─── 8. 9 Collections ─── */
    const collections = [
        { name: '[TEST] Kính Cận', slug: 'test-kinh-can', sort: 1 },
        { name: '[TEST] Kính Râm', slug: 'test-kinh-ram', sort: 2 },
        { name: '[TEST] Gọng Nam', slug: 'test-gong-nam', sort: 3 },
        { name: '[TEST] Gọng Nữ', slug: 'test-gong-nu', sort: 4 },
        { name: '[TEST] Tròng Kính', slug: 'test-trong-kinh', sort: 5 },
        { name: '[TEST] Phụ Kiện', slug: 'test-phu-kien', sort: 6 },
        { name: '[TEST] Xu Hướng', slug: 'test-trending', sort: 7 },
        { name: '[TEST] Bán Chạy', slug: 'test-best-sellers', sort: 8 },
        { name: '[TEST] Mới Về', slug: 'test-new-arrivals', sort: 9 },
    ];
    for (const c of collections) {
        await prisma.collection.upsert({ where: { slug: c.slug }, update: {}, create: c });
    }
    console.log('  ✓ 9 collections');

    /* ─── 9. 30 Products + Variants ─── */
    const productIds: string[] = [];
    const variantIds: string[] = [];
    for (let i = 0; i < PRODUCT_TEMPLATES.length; i++) {
        const t = PRODUCT_TEMPLATES[i];
        const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const brand = BRANDS[t.brand];
        const shape = SHAPES[t.shape];
        const mat = MATS[t.mat % MATS.length];

        const variantCount = 1 + (i % 3);
        const variants = [];
        for (let v = 0; v < variantCount; v++) {
            variants.push({
                id: tid(`variant_${i}_${v}`),
                sku: `T${brand.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}-V${v + 1}`,
                frameColor: COLORS[(i + v) % COLORS.length],
                lensColor: LENS_COLORS[v % LENS_COLORS.length],
                price: t.price + v * 200000,
                compareAtPrice: v === 0 ? Math.round(t.price * 1.3) : undefined,
                stockQty: randInt(5, 50),
            });
        }

        const product = await prisma.product.upsert({
            where: { slug },
            update: {},
            create: {
                id: tid(`product_${i}`),
                name: t.name,
                slug,
                brand,
                description: `[TEST] Gọng kính ${t.name} cao cấp từ ${brand}. Chất liệu ${mat}, kiểu dáng ${shape}.`,
                frameShape: shape,
                material: mat,
                faceShape: [pick(FACES)],
                style: [pick(STYLES_ARR)],
                gender: GENDERS[i % GENDERS.length],
                lensWidth: randInt(48, 58),
                bridge: randInt(14, 20),
                templeLength: randInt(135, 150),
                tags: [TEST_TAG, brand.toLowerCase(), shape.toLowerCase()],
                status: i < 28 ? 'ACTIVE' : 'DRAFT',
                variants: { create: variants },
            },
            include: { variants: true },
        });
        productIds.push(product.id);
        product.variants.forEach((v: { id: string }) => variantIds.push(v.id));
    }
    console.log(`  ✓ 30 products (${variantIds.length} variants)`);

    /* ─── 10. 50 Orders ─── */
    const statusWeights = [5, 5, 3, 8, 20, 5, 4];
    let orderIndex = 0;
    const orderIds: string[] = [];
    for (let s = 0; s < ORDER_STATUSES.length; s++) {
        for (let j = 0; j < statusWeights[s]; j++) {
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
                    id: tid(`order_${orderIndex}`),
                    code: `TSMK-${String(orderIndex).padStart(4, '0')}`,
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
                            skuSnapshot: `TSKU-${String(orderIndex).padStart(4, '0')}`,
                        }],
                    },
                },
            });
            orderIds.push(order.id);

            // Order Status History
            await prisma.orderStatusHistory.create({
                data: { orderId: order.id, status, changedBy: adminUser.id, note: `[TEST] Auto-generated status: ${status}` },
            });

            // Partner referral + commission
            if (partner) {
                await prisma.orderReferral.create({
                    data: { orderId: order.id, partnerId: partner.id, attributionType: Math.random() > 0.5 ? 'COUPON' : 'LAST_CLICK' },
                });
                if (status === 'DELIVERED') {
                    const levelPercent = partner.level === 'LEADER' ? 12 : partner.level === 'AGENT' ? 8 : 5;
                    await prisma.commission.create({
                        data: {
                            id: tid(`comm_${orderIndex}`),
                            orderId: order.id,
                            partnerId: partner.id,
                            amount: Math.round(total * levelPercent / 100),
                            status: Math.random() > 0.3 ? 'AVAILABLE' : 'PENDING',
                            holdUntil: dateAfter(14),
                        },
                    });
                }
            }
        }
    }
    console.log('  ✓ 50 orders + status history + referrals + commissions');

    /* ─── 11. Reviews (40 reviews) ─── */
    for (let i = 0; i < 40; i++) {
        await prisma.review.create({
            data: {
                id: tid(`review_${i}`),
                productId: pick(productIds),
                userId: pick(customers).id,
                rating: randInt(3, 5),
                comment: `[TEST] ${pick(REVIEW_COMMENTS)}`,
                status: i < 35 ? 'APPROVED' : pick(['PENDING', 'REJECTED']),
                createdAt: dateBefore(randInt(1, 60)),
            },
        });
    }
    console.log('  ✓ 40 reviews');

    /* ─── 12. Questions (20 Q&A) ─── */
    for (let i = 0; i < 20; i++) {
        await prisma.question.create({
            data: {
                id: tid(`question_${i}`),
                productId: pick(productIds),
                userId: pick(customers).id,
                content: `[TEST] ${pick(QUESTIONS)}`,
                answer: i < 12 ? `[TEST] Dạ, cảm ơn bạn đã hỏi. ${pick(['Kính phù hợp ạ.', 'Bảo hành 12 tháng ạ.', 'Có thể đổi trong 14 ngày ạ.', 'Ship COD trên toàn quốc ạ.'])}` : null,
                answeredBy: i < 12 ? adminUser.id : null,
            },
        });
    }
    console.log('  ✓ 20 Q&A');

    /* ─── 13. Wishlist items (30) ─── */
    for (let i = 0; i < 30; i++) {
        try {
            await prisma.wishlistItem.create({
                data: { id: tid(`wish_${i}`), userId: customers[i % 20].id, productId: productIds[i % productIds.length] },
            });
        } catch { /* skip duplicate */ }
    }
    console.log('  ✓ 30 wishlist items');

    /* ─── 14. View History (50) ─── */
    for (let i = 0; i < 50; i++) {
        await prisma.viewHistory.create({
            data: { id: tid(`view_${i}`), userId: customers[i % 20].id, productId: productIds[i % productIds.length], viewedAt: dateBefore(randInt(0, 14)) },
        });
    }
    console.log('  ✓ 50 view history entries');

    /* ─── 15. Return Requests (8) ─── */
    const deliveredOrders = orderIds.filter((_, i) => i >= 26 && i < 46); // DELIVERED orders
    for (let i = 0; i < Math.min(8, deliveredOrders.length); i++) {
        await prisma.returnRequest.create({
            data: {
                id: tid(`return_${i}`),
                orderId: deliveredOrders[i],
                userId: pick(customers).id,
                reason: pick(['Không vừa size', 'Sản phẩm lỗi', 'Không đúng mô tả', 'Đổi sang mẫu khác']),
                status: pick(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED']),
                items: [{ productName: 'TEST Product', qty: 1 }],
            },
        });
    }
    console.log('  ✓ 8 return requests');

    /* ─── 16. Warehouses + Inventory Vouchers ─── */
    const wh = await prisma.warehouse.upsert({
        where: { id: tid('warehouse_main') },
        update: {},
        create: { id: tid('warehouse_main'), name: '[TEST] Kho chính HCM', code: 'TWH-HCM', address: '123 Nguyễn Huệ, Q1, HCM', isDefault: true },
    });
    const wh2 = await prisma.warehouse.upsert({
        where: { id: tid('warehouse_hn') },
        update: {},
        create: { id: tid('warehouse_hn'), name: '[TEST] Kho Hà Nội', code: 'TWH-HN', address: '45 Phố Cổ, HK, HN', isDefault: false },
    });
    // Inventory vouchers
    for (let i = 0; i < 5; i++) {
        await prisma.inventoryVoucher.create({
            data: {
                id: tid(`inv_voucher_${i}`),
                voucherType: i < 3 ? 'INBOUND' : 'TRANSFER',
                warehouseId: i < 3 ? wh.id : wh.id,
                toWarehouseId: i >= 3 ? wh2.id : undefined,
                createdBy: adminUser.id,
                note: `[TEST] ${i < 3 ? 'Nhập hàng đợt ' + (i + 1) : 'Chuyển kho đợt ' + (i - 2)}`,
                status: 'COMPLETED',
                items: {
                    create: [{
                        variantId: variantIds[i % variantIds.length],
                        qty: randInt(10, 50),
                    }],
                },
            },
        });
    }
    console.log('  ✓ 2 warehouses + 5 inventory vouchers');

    /* ─── 17. Carrier Configs ─── */
    const carriers = [
        { name: '[TEST] Giao Hàng Nhanh', code: 'TGHN', provider: 'GHN' },
        { name: '[TEST] Giao Hàng Tiết Kiệm', code: 'TGHTK', provider: 'GHTK' },
        { name: '[TEST] Viettel Post', code: 'TVTP', provider: 'VTP' },
    ];
    for (const cr of carriers) {
        await prisma.carrierConfig.upsert({
            where: { id: tid(`carrier_${cr.code}`) },
            update: {},
            create: { id: tid(`carrier_${cr.code}`), name: cr.name, code: cr.code, provider: cr.provider, isActive: true, apiConfig: { token: 'test_token', shopId: 'test_shop' } },
        });
    }
    console.log('  ✓ 3 carrier configs');

    /* ─── 18. Shipments ─── */
    const shippingOrders = orderIds.filter((_, i) => i >= 18 && i < 46); // SHIPPING + DELIVERED orders
    for (let i = 0; i < Math.min(10, shippingOrders.length); i++) {
        await prisma.shipment.create({
            data: {
                id: tid(`shipment_${i}`),
                orderId: shippingOrders[i],
                carrierId: tid(`carrier_${carriers[i % 3].code}`),
                trackingCode: `TTRK${String(1000 + i)}`,
                status: i < 5 ? 'IN_TRANSIT' : 'DELIVERED',
                estimatedDelivery: dateAfter(randInt(1, 5)),
                weight: randInt(100, 500),
                fee: randInt(20000, 50000),
                events: {
                    create: [
                        { status: 'PICKED_UP', location: 'Kho HCM', note: '[TEST] Đã lấy hàng', timestamp: dateBefore(3) },
                        { status: 'IN_TRANSIT', location: 'Trung chuyển', note: '[TEST] Đang vận chuyển', timestamp: dateBefore(2) },
                    ],
                },
            },
        });
    }
    console.log('  ✓ 10 shipments + events');

    /* ─── 19. AI Content Logs (10) ─── */
    const aiModules = ['content-gen', 'seo-writer', 'product-desc', 'email-marketing', 'forecast', 'pricing', 'restock', 'fraud', 'stylist', 'support-reply'];
    for (let i = 0; i < 10; i++) {
        await prisma.aIContentLog.create({
            data: {
                id: tid(`ai_log_${i}`),
                module: aiModules[i],
                prompt: `[TEST] Generate ${aiModules[i]} content for test product`,
                result: `[TEST] AI generated result for module ${aiModules[i]}: Lorem ipsum dolor sit amet...`,
                userId: adminUser.id,
                tokens: randInt(100, 2000),
            },
        });
    }
    console.log('  ✓ 10 AI content logs');

    /* ─── 20. Event Logs / Audit Trail (20) ─── */
    const eventActions = ['user.login', 'order.create', 'product.update', 'admin.settings', 'partner.payout', 'order.status_change', 'review.approve', 'inventory.adjust', 'coupon.create', 'return.approve'];
    for (let i = 0; i < 20; i++) {
        await prisma.eventLog.create({
            data: {
                id: tid(`event_${i}`),
                action: eventActions[i % eventActions.length],
                actor: pick([adminUser.id, managerUser.id, staffUser.id]),
                target: `[TEST] ${pick(['Order TSMK-0001', 'Product TEST Aviator', 'User customer1', 'Coupon TWELCOME10'])}`,
                meta: { testData: true, note: `[TEST] Auto-generated audit log #${i + 1}` },
                ip: `192.168.1.${randInt(1, 254)}`,
                createdAt: dateBefore(randInt(0, 30)),
            },
        });
    }
    console.log('  ✓ 20 audit/event logs');

    /* ─── 21. Partner Wallet Transactions (15) ─── */
    for (let i = 0; i < 15; i++) {
        const p = pick(partners);
        await prisma.partnerWalletTx.create({
            data: {
                id: tid(`wallet_tx_${i}`),
                partnerId: p.id,
                type: i < 10 ? 'COMMISSION' : 'WITHDRAWAL',
                amount: i < 10 ? randInt(100000, 500000) : -randInt(200000, 1000000),
                balanceAfter: randInt(500000, 5000000),
                note: `[TEST] ${i < 10 ? 'Hoa hồng đơn TSMK-' + String(randInt(1, 50)).padStart(4, '0') : 'Rút tiền về ngân hàng'}`,
            },
        });
    }
    console.log('  ✓ 15 partner wallet transactions');

    /* ─── 22. Payout Requests (5) ─── */
    for (let i = 0; i < 5; i++) {
        const p = partners[i * 2];
        await prisma.payoutRequest.create({
            data: {
                id: tid(`payout_${i}`),
                partnerId: p.id,
                amount: randInt(500000, 2000000),
                bankInfo: { bank: 'Vietcombank', account: `${randInt(100000, 999999)}`, name: p.storeName || 'Partner' },
                status: pick(['PENDING', 'APPROVED', 'PAID', 'REJECTED']),
            },
        });
    }
    console.log('  ✓ 5 payout requests');

    /* ═══ SUMMARY ═══ */
    console.log('\n✅ FULL TEST DATA SEED COMPLETE!');
    console.log('   📦 30 products · 👥 20 customers · 🤝 10 partners · 🛒 50 orders');
    console.log('   ⭐ 40 reviews · ❓ 20 Q&A · ❤️ 30 wishlist · 👀 50 views');
    console.log('   🔄 8 returns · 🏪 2 warehouses · 🚚 10 shipments · 🤖 10 AI logs');
    console.log('   📋 20 audit logs · 💰 15 wallet txn · 💳 5 payouts · 🎫 10 coupons');
    console.log('\n🔑 Admin login: nguyendinhduy@sieuthimatkinh.vn / Nguyendinhduy@95');
    console.log('   Test staff:  test.manager@sieuthimatkinh.vn / Test@12345');
    console.log('\n🧹 To cleanup: npx tsx prisma/cleanup-test-data.ts\n');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
