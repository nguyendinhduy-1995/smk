import { PrismaClient, PartnerLevel, CommScope, CouponType, PaymentMethod, EventType, CarrierCode, ReturnType, VoucherType, WalletTxType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres_dev_2026@localhost:5432/sieuthimatkinh?schema=public';
const pool = new pg.Pool({ connectionString: url, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * ═══════════════════════════════════════════════════════════
 *  SMK — Full Feature Test Data Seed
 *  All test data is marked with TEST_ prefix or [TEST] tag
 *  Run cleanup: npx tsx prisma/cleanup-test-data.ts
 * ═══════════════════════════════════════════════════════════
 */

const TEST_PREFIX = 'TEST_';
function tid(base: string) { return `${TEST_PREFIX}${base}`; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }
function dateBefore(daysAgo: number) { return new Date(Date.now() - daysAgo * 86400000); }
function dateAfter(daysAhead: number) { return new Date(Date.now() + daysAhead * 86400000); }

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

const PRODUCT_TEMPLATES = Array.from({ length: 30 }, (_, i) => ({
    name: `TEST Product ${i + 1} ${BRANDS[i % 5]} ${SHAPES[i % 8]}`,
    shape: i % 8,
    mat: i % 5,
    brand: i % 5,
    price: 1490000 + i * 350000,
}));

async function main() {
    console.log('🌱 SMK FULL TEST DATA SEED\n');

    /* ─── 1. Admin user (permanent) ─── */
    const adminHash = await bcrypt.hash('Nguyendinhduy@95', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'nguyendinhduy@sieuthimatkinh.vn' },
        update: { password: adminHash, role: 'ADMIN', name: 'Nguyễn Đình Duy' },
        create: { id: 'admin_nguyendinhduy', email: 'nguyendinhduy@sieuthimatkinh.vn', phone: '0900000001', name: 'Nguyễn Đình Duy', role: 'ADMIN', password: adminHash },
    });
    console.log('  ✓ Admin: nguyendinhduy@sieuthimatkinh.vn / Nguyendinhduy@95');

    /* ─── 2. Test staff ─── */
    const testHash = await bcrypt.hash('Test@12345', 10);
    const managerUser = await prisma.user.upsert({
        where: { email: 'test.manager@sieuthimatkinh.vn' },
        update: {},
        create: { id: tid('manager'), email: 'test.manager@sieuthimatkinh.vn', phone: '0900100001', name: '[TEST] Store Manager', role: 'STORE_MANAGER', password: testHash, permissions: ['products', 'orders', 'customers', 'shipping', 'returns', 'warehouse', 'reviews'] },
    });
    await prisma.user.upsert({
        where: { email: 'test.staff@sieuthimatkinh.vn' },
        update: {},
        create: { id: tid('staff'), email: 'test.staff@sieuthimatkinh.vn', phone: '0900100002', name: '[TEST] Staff Member', role: 'STAFF', password: testHash, permissions: ['orders', 'customers', 'support'] },
    });
    console.log('  ✓ Test Manager + Staff');

    /* ─── 3. 20 Customers ─── */
    const names = ['An', 'Mai', 'Long', 'Tuấn', 'Hà', 'Lan', 'Anh', 'Trang', 'Huy', 'Thu', 'Khánh', 'Linh', 'Đức', 'Hà', 'Sơn', 'Yến', 'Minh', 'Vy', 'Thắng', 'Giang'];
    const customers = [];
    for (let i = 0; i < 20; i++) {
        const c = await prisma.user.upsert({
            where: { email: `test.customer${i + 1}@example.com` },
            update: {},
            create: { id: tid(`cust_${i}`), email: `test.customer${i + 1}@example.com`, phone: `098${String(10000000 + i).padStart(8, '0')}`, name: `[TEST] ${names[i]}`, role: 'CUSTOMER', password: testHash },
        });
        customers.push(c);
    }
    console.log('  ✓ 20 customers');

    /* ─── 4. Addresses ─── */
    for (let i = 0; i < 20; i++) {
        await prisma.address.upsert({
            where: { id: tid(`addr_${i}`) },
            update: {},
            create: { id: tid(`addr_${i}`), userId: customers[i].id, name: customers[i].name || '', phone: customers[i].phone || '', province: pick(PROVINCES), district: pick(DISTRICTS), ward: `Phường ${randInt(1, 15)}`, street: `${randInt(1, 200)} Nguyễn Huệ`, isDefault: true },
        });
    }
    console.log('  ✓ 20 addresses');

    /* ─── 5. 10 Partners ─── */
    const partnerDefs: { code: string; name: string; level: PartnerLevel }[] = [
        { code: 'TAFF01', name: '[TEST] Affiliate 1', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF02', name: '[TEST] Affiliate 2', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF03', name: '[TEST] Affiliate 3', level: PartnerLevel.AFFILIATE },
        { code: 'TAFF04', name: '[TEST] Affiliate 4', level: PartnerLevel.AFFILIATE },
        { code: 'TAGT01', name: '[TEST] Agent 1', level: PartnerLevel.AGENT },
        { code: 'TAGT02', name: '[TEST] Agent 2', level: PartnerLevel.AGENT },
        { code: 'TAGT03', name: '[TEST] Agent 3', level: PartnerLevel.AGENT },
        { code: 'TAGT04', name: '[TEST] Agent 4', level: PartnerLevel.AGENT },
        { code: 'TLDR01', name: '[TEST] Leader 1', level: PartnerLevel.LEADER },
        { code: 'TLDR02', name: '[TEST] Leader 2', level: PartnerLevel.LEADER },
    ];
    const partners = [];
    for (const pd of partnerDefs) {
        const pu = await prisma.user.upsert({
            where: { email: `${pd.code.toLowerCase()}@testpartner.com` },
            update: {},
            create: { id: tid(`pu_${pd.code}`), email: `${pd.code.toLowerCase()}@testpartner.com`, phone: `097${randInt(1000000, 9999999)}`, name: pd.name, role: 'PARTNER', password: testHash },
        });
        const pp = await prisma.partnerProfile.upsert({
            where: { userId: pu.id },
            update: {},
            create: { id: tid(`pp_${pd.code}`), userId: pu.id, partnerCode: pd.code, level: pd.level, status: 'ACTIVE', bankAccount: { bank: 'VCB', number: `${randInt(100000, 999999)}` }, storeName: `[TEST] ${pd.name}` },
        });
        partners.push(pp);
    }
    console.log('  ✓ 10 partners');

    /* ─── 6. Commission Rules ─── */
    for (const [i, [scope, pct]] of [[CommScope.GLOBAL, 5], [CommScope.CATEGORY, 8], [CommScope.PRODUCT, 10], [CommScope.GLOBAL, 12]].entries()) {
        await prisma.commissionRule.upsert({ where: { id: tid(`rule_${i}`) }, update: {}, create: { id: tid(`rule_${i}`), scope: scope as CommScope, percent: pct as number } });
    }
    console.log('  ✓ 4 commission rules');

    /* ─── 7. 10 Coupons ─── */
    const coupons: [string, CouponType, number][] = [
        ['TWELCOME10', CouponType.PERCENT, 10], ['TFLAT50K', CouponType.FIXED, 50000], ['TSUMMER20', CouponType.PERCENT, 20],
        ['TFREESHIP', CouponType.FIXED, 30000], ['TVIP15', CouponType.PERCENT, 15],
        ['TDUY10', CouponType.PERCENT, 10], ['TTHAO8', CouponType.PERCENT, 8], ['TBINH5', CouponType.PERCENT, 5],
        ['THANOI12', CouponType.PERCENT, 12], ['TSAIGON10', CouponType.PERCENT, 10],
    ];
    for (let i = 0; i < coupons.length; i++) {
        const [code, type, value] = coupons[i];
        await prisma.coupon.upsert({
            where: { code },
            update: {},
            create: { code, type, value, ownerPartnerId: i >= 5 ? partners[i - 1].id : undefined, startsAt: new Date('2026-01-01'), endsAt: new Date('2027-12-31'), isActive: true },
        });
    }
    console.log('  ✓ 10 coupons');

    /* ─── 8. Collections ─── */
    const colls = ['test-kinh-can', 'test-kinh-ram', 'test-gong-nam', 'test-gong-nu', 'test-trong-kinh', 'test-phu-kien', 'test-trending', 'test-best-sellers', 'test-new-arrivals'];
    for (let i = 0; i < colls.length; i++) {
        await prisma.collection.upsert({ where: { slug: colls[i] }, update: {}, create: { name: `[TEST] ${colls[i]}`, slug: colls[i], sort: i + 1 } });
    }
    console.log('  ✓ 9 collections');

    /* ─── 9. 30 Products ─── */
    const productIds: string[] = [];
    const variantIds: string[] = [];
    for (let i = 0; i < PRODUCT_TEMPLATES.length; i++) {
        const t = PRODUCT_TEMPLATES[i];
        const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const variants = [];
        for (let v = 0; v < 1 + (i % 3); v++) {
            variants.push({
                id: tid(`var_${i}_${v}`),
                sku: `TSKU-${String(i + 1).padStart(3, '0')}-V${v + 1}`,
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
                id: tid(`prod_${i}`), name: t.name, slug,
                brand: BRANDS[t.brand], description: `[TEST] ${t.name} from ${BRANDS[t.brand]}`,
                frameShape: SHAPES[t.shape], material: MATS[t.mat],
                faceShape: [pick(FACES)], style: [pick(STYLES_ARR)],
                gender: GENDERS[i % 3],
                lensWidth: randInt(48, 58), bridge: randInt(14, 20), templeLength: randInt(135, 150),
                tags: ['test-data', BRANDS[t.brand].toLowerCase()],
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
    let oi = 0;
    const orderIds: string[] = [];
    for (let s = 0; s < ORDER_STATUSES.length; s++) {
        for (let j = 0; j < statusWeights[s]; j++) {
            oi++;
            const cust = pick(customers);
            const partner = Math.random() > 0.4 ? pick(partners) : null;
            const variant = pick(variantIds);
            const qty = randInt(1, 3);
            const price = PRODUCT_TEMPLATES[oi % 30].price;
            const total = price * qty;
            const status = ORDER_STATUSES[s];
            const daysAgo = randInt(1, 30);
            const fee = total >= 500000 ? 0 : 30000;

            const order = await prisma.order.create({
                data: {
                    id: tid(`ord_${oi}`), code: `TSMK-${String(oi).padStart(4, '0')}`,
                    userId: cust.id, status, subtotal: total, total: total + fee, shippingFee: fee,
                    shippingAddress: { name: cust.name, phone: cust.phone || '', address: `${randInt(1, 200)} Nguyễn Huệ, Q1, HCM` },
                    paymentMethod: pick([PaymentMethod.COD, PaymentMethod.BANK_TRANSFER, PaymentMethod.MOMO, PaymentMethod.ZALOPAY]),
                    deliveredAt: status === 'DELIVERED' ? dateBefore(daysAgo) : null,
                    createdAt: dateBefore(daysAgo + randInt(0, 5)),
                    items: { create: [{ variantId: variant, qty, price, nameSnapshot: PRODUCT_TEMPLATES[oi % 30].name, skuSnapshot: `TSKU-${String(oi).padStart(4, '0')}` }] },
                },
            });
            orderIds.push(order.id);

            // Status history (no changedBy — it's not in the schema)
            await prisma.orderStatusHistory.create({ data: { orderId: order.id, status, note: `[TEST] ${status}` } });

            if (partner) {
                await prisma.orderReferral.create({ data: { orderId: order.id, partnerId: partner.id, attributionType: Math.random() > 0.5 ? 'COUPON' : 'LAST_CLICK' } });
                if (status === 'DELIVERED') {
                    const pct = partner.level === 'LEADER' ? 12 : partner.level === 'AGENT' ? 8 : 5;
                    await prisma.commission.create({ data: { id: tid(`comm_${oi}`), orderId: order.id, partnerId: partner.id, amount: Math.round(total * pct / 100), status: Math.random() > 0.3 ? 'AVAILABLE' : 'PENDING', holdUntil: dateAfter(14) } });
                }
            }
        }
    }
    console.log('  ✓ 50 orders + history + referrals + commissions');

    /* ─── 11. Reviews (40) — uses body, not comment ─── */
    for (let i = 0; i < 40; i++) {
        await prisma.review.create({
            data: { id: tid(`rev_${i}`), productId: pick(productIds), userId: pick(customers).id, rating: randInt(3, 5), title: `[TEST] Review #${i + 1}`, body: `[TEST] Kính rất đẹp, chất lượng tốt! Đánh giá ${randInt(3, 5)} sao.`, createdAt: dateBefore(randInt(1, 60)) },
        });
    }
    console.log('  ✓ 40 reviews');

    /* ─── 12. Questions (20) — uses question field ─── */
    const qTexts = ['Kính này có phù hợp mặt tròn không?', 'Có bảo hành bao lâu ạ?', 'Có đổi màu khác được không?', 'Có thể lắp tròng cận không?', 'Ship về Đà Nẵng mất mấy ngày?'];
    for (let i = 0; i < 20; i++) {
        await prisma.question.create({
            data: { id: tid(`q_${i}`), productId: pick(productIds), userId: pick(customers).id, question: `[TEST] ${pick(qTexts)}`, answer: i < 12 ? `[TEST] Dạ, cảm ơn bạn đã hỏi. Kính phù hợp ạ.` : null, answeredBy: i < 12 ? adminUser.id : null },
        });
    }
    console.log('  ✓ 20 Q&A');

    /* ─── 13. Wishlist (30) ─── */
    for (let i = 0; i < 30; i++) {
        try { await prisma.wishlistItem.create({ data: { id: tid(`wish_${i}`), userId: customers[i % 20].id, productId: productIds[i % productIds.length] } }); } catch { /* dup */ }
    }
    console.log('  ✓ 30 wishlist');

    /* ─── 14. View History (50) ─── */
    for (let i = 0; i < 50; i++) {
        await prisma.viewHistory.create({ data: { id: tid(`vh_${i}`), userId: customers[i % 20].id, productId: productIds[i % productIds.length], viewedAt: dateBefore(randInt(0, 14)) } });
    }
    console.log('  ✓ 50 view history');

    /* ─── 15. Returns (8) — requires type + code ─── */
    const deliveredOrders = orderIds.filter((_, i) => i >= 26 && i < 46);
    for (let i = 0; i < Math.min(8, deliveredOrders.length); i++) {
        await prisma.returnRequest.create({
            data: { id: tid(`ret_${i}`), code: `TRMA-${String(i + 1).padStart(5, '0')}`, orderId: deliveredOrders[i], userId: pick(customers).id, type: pick([ReturnType.RETURN, ReturnType.EXCHANGE, ReturnType.WARRANTY]), reason: pick(['Không vừa size', 'Sản phẩm lỗi', 'Không đúng mô tả']), status: pick(['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED']) },
        });
    }
    console.log('  ✓ 8 returns');

    /* ─── 16. Warehouses — no isDefault field ─── */
    const wh = await prisma.warehouse.upsert({ where: { id: tid('wh_hcm') }, update: {}, create: { id: tid('wh_hcm'), name: '[TEST] Kho HCM', code: 'TWH-HCM', address: '123 Nguyễn Huệ, Q1, HCM' } });
    const wh2 = await prisma.warehouse.upsert({ where: { id: tid('wh_hn') }, update: {}, create: { id: tid('wh_hn'), name: '[TEST] Kho HN', code: 'TWH-HN', address: '45 Phố Cổ, HK, HN' } });
    // Inventory vouchers — uses VoucherType enum (RECEIPT, ISSUE, ADJUST) and requires code field
    for (let i = 0; i < 5; i++) {
        await prisma.inventoryVoucher.create({
            data: { id: tid(`iv_${i}`), code: `TVCH-${String(i + 1).padStart(3, '0')}`, type: i < 3 ? VoucherType.RECEIPT : VoucherType.ADJUST, warehouseId: i < 3 ? wh.id : wh2.id, createdBy: adminUser.id, note: `[TEST] Voucher ${i + 1}`, status: 'POSTED', items: { create: [{ variantId: variantIds[i % variantIds.length], qty: randInt(10, 50) }] } },
        });
    }
    console.log('  ✓ 2 warehouses + 5 inventory vouchers');

    /* ─── 17. Carriers — uses carrier enum (CarrierCode), not code string ─── */
    for (const [cr, name] of [[CarrierCode.GHN, '[TEST] GHN'], [CarrierCode.GHTK, '[TEST] GHTK'], [CarrierCode.VIETTEL_POST, '[TEST] VTP']] as const) {
        await prisma.carrierConfig.upsert({
            where: { carrier: cr },
            update: { name },
            create: { id: tid(`cc_${cr}`), carrier: cr, name, enabled: true, config: { token: 'test' } },
        });
    }
    console.log('  ✓ 3 carrier configs');

    /* ─── 18. Shipments — carrier is enum, events use carrierStatus/mappedStatus/occurredAt/idempotencyKey ─── */
    const shipOrders = orderIds.filter((_, i) => i >= 18 && i < 46);
    for (let i = 0; i < Math.min(10, shipOrders.length); i++) {
        await prisma.shipment.create({
            data: {
                id: tid(`ship_${i}`), orderId: shipOrders[i], carrier: pick([CarrierCode.GHN, CarrierCode.GHTK, CarrierCode.VIETTEL_POST]),
                trackingCode: `TTRK${String(1000 + i)}`, status: i < 5 ? 'IN_TRANSIT' : 'DELIVERED',
                estimatedAt: dateAfter(randInt(1, 5)), weight: randInt(100, 500), shippingFee: randInt(20000, 50000),
                events: {
                    create: [
                        { carrierStatus: 'picked_up', mappedStatus: 'PICKED_UP', location: 'Kho HCM', note: '[TEST] Đã lấy hàng', occurredAt: dateBefore(3), idempotencyKey: `test_${i}_pickup` },
                        { carrierStatus: 'in_transit', mappedStatus: 'IN_TRANSIT', location: 'Trung chuyển', note: '[TEST] Đang vận chuyển', occurredAt: dateBefore(2), idempotencyKey: `test_${i}_transit` },
                    ]
                },
            },
        });
    }
    console.log('  ✓ 10 shipments');

    /* ─── 19. AI Content Logs — uses channel, tone, input (Json), output (Json) ─── */
    const channels = ['website', 'facebook', 'tiktok', 'zalo'];
    const tones = ['casual', 'premium', 'young', 'kol_review'];
    for (let i = 0; i < 10; i++) {
        await prisma.aIContentLog.create({
            data: { id: tid(`ai_${i}`), productId: productIds[i % productIds.length], channel: pick(channels), tone: pick(tones), input: { name: PRODUCT_TEMPLATES[i].name, price: PRODUCT_TEMPLATES[i].price }, output: { title: `[TEST] Generated content #${i}`, body: 'Lorem ipsum...' }, tokens: randInt(100, 2000), latencyMs: randInt(500, 3000), createdBy: adminUser.id },
        });
    }
    console.log('  ✓ 10 AI logs');

    /* ─── 20. Event Logs — uses EventType enum ─── */
    const eventTypes = [EventType.VIEW_PRODUCT, EventType.ADD_TO_CART, EventType.PURCHASE, EventType.ORDER_CONFIRMED, EventType.ORDER_DELIVERED, EventType.COMMISSION_AVAILABLE, EventType.PRODUCT_UPDATED, EventType.INVENTORY_VOUCHER_POSTED, EventType.AI_CONTENT_GENERATED, EventType.PAYOUT_REQUESTED];
    for (let i = 0; i < 20; i++) {
        await prisma.eventLog.create({
            data: { id: tid(`evt_${i}`), type: pick(eventTypes), actorUserId: pick([adminUser.id, managerUser.id]), userId: pick(customers).id, payload: { testData: true, note: `[TEST] Event #${i}` }, createdAt: dateBefore(randInt(0, 30)) },
        });
    }
    console.log('  ✓ 20 event logs');

    /* ─── 21. Partner Wallet Tx — uses WalletTxType enum (EARN, PAYOUT, not WITHDRAWAL) ─── */
    for (let i = 0; i < 15; i++) {
        const p = pick(partners);
        await prisma.partnerWalletTx.create({
            data: { id: tid(`wtx_${i}`), partnerId: p.id, type: i < 10 ? WalletTxType.EARN : WalletTxType.PAYOUT, amount: i < 10 ? randInt(100000, 500000) : -randInt(200000, 1000000), balanceAfter: randInt(500000, 5000000), note: `[TEST] Tx #${i}` },
        });
    }
    console.log('  ✓ 15 wallet transactions');

    /* ─── 22. Payout Requests — status uses PayoutStatus enum (REQUESTED, not PENDING) ─── */
    for (let i = 0; i < 5; i++) {
        const p = partners[i * 2];
        await prisma.payoutRequest.create({
            data: { id: tid(`pout_${i}`), partnerId: p.id, amount: randInt(500000, 2000000), status: pick(['REQUESTED', 'APPROVED', 'PAID', 'REJECTED']), note: `[TEST] Payout #${i}` },
        });
    }
    console.log('  ✓ 5 payout requests');

    /* ═══ DONE ═══ */
    console.log('\n✅ FULL TEST DATA SEED COMPLETE!');
    console.log('   📦 30 products · 👥 20 customers · 🤝 10 partners · 🛒 50 orders');
    console.log('   ⭐ 40 reviews · ❓ 20 Q&A · ❤️ 30 wishlist · 👀 50 views');
    console.log('   🔄 8 returns · 🏪 2 warehouses · 🚚 10 shipments · 🤖 10 AI logs');
    console.log('   📋 20 events · 💰 15 wallet tx · 💳 5 payouts · 🎫 10 coupons\n');
    console.log('🔑 Admin: nguyendinhduy@sieuthimatkinh.vn / Nguyendinhduy@95');
    console.log('🧹 Cleanup: npx tsx prisma/cleanup-test-data.ts\n');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
