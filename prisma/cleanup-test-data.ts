import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * ═══════════════════════════════════════════════════════════
 *  SMK — Cleanup Test Data
 *  Removes ALL records with TEST_ prefix IDs
 *  Preserves the admin user (nguyendinhduy@sieuthimatkinh.vn)
 * ═══════════════════════════════════════════════════════════
 */
async function cleanup() {
    console.log('🧹 Cleaning up test data...\n');

    // Delete in dependency order (child → parent)
    const results: [string, number][] = [];

    // 1. Shipment events (via shipments)
    const testShipments = await prisma.shipment.findMany({ where: { id: { startsWith: 'TEST_' } }, select: { id: true } });
    if (testShipments.length) {
        const r = await prisma.shipmentEvent.deleteMany({ where: { shipmentId: { in: testShipments.map(s => s.id) } } });
        results.push(['ShipmentEvent', r.count]);
    }

    // 2. Shipments
    const r2 = await prisma.shipment.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Shipment', r2.count]);

    // 3. Voucher items (via inventory vouchers)
    const testVouchers = await prisma.inventoryVoucher.findMany({ where: { id: { startsWith: 'TEST_' } }, select: { id: true } });
    if (testVouchers.length) {
        const r = await prisma.voucherItem.deleteMany({ where: { voucherId: { in: testVouchers.map(v => v.id) } } });
        results.push(['VoucherItem', r.count]);
    }

    // 4. Inventory vouchers
    const r4 = await prisma.inventoryVoucher.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['InventoryVoucher', r4.count]);

    // 5. Warehouses
    const r5 = await prisma.warehouse.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Warehouse', r5.count]);

    // 6. Carrier configs
    const r6 = await prisma.carrierConfig.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['CarrierConfig', r6.count]);

    // 7. Return requests
    const r7 = await prisma.returnRequest.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['ReturnRequest', r7.count]);

    // 8. Order items, status history, referrals (via orders)
    const testOrders = await prisma.order.findMany({ where: { id: { startsWith: 'TEST_' } }, select: { id: true } });
    if (testOrders.length) {
        const orderIds = testOrders.map(o => o.id);
        const r8a = await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        results.push(['OrderItem', r8a.count]);
        const r8b = await prisma.orderStatusHistory.deleteMany({ where: { orderId: { in: orderIds } } });
        results.push(['OrderStatusHistory', r8b.count]);
        const r8c = await prisma.orderReferral.deleteMany({ where: { orderId: { in: orderIds } } });
        results.push(['OrderReferral', r8c.count]);
    }

    // 9. Commissions
    const r9 = await prisma.commission.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Commission', r9.count]);

    // 10. Orders
    const r10 = await prisma.order.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Order', r10.count]);

    // 11. Payout requests
    const r11 = await prisma.payoutRequest.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['PayoutRequest', r11.count]);

    // 12. Partner wallet txn
    const r12 = await prisma.partnerWalletTx.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['PartnerWalletTx', r12.count]);

    // 13. Coupons (TEST codes start with T)
    const r13 = await prisma.coupon.deleteMany({ where: { code: { startsWith: 'T' } } });
    results.push(['Coupon', r13.count]);

    // 14. Commission rules
    const r14 = await prisma.commissionRule.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['CommissionRule', r14.count]);

    // 15. Reviews
    const r15 = await prisma.review.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Review', r15.count]);

    // 16. Questions
    const r16 = await prisma.question.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Question', r16.count]);

    // 17. Wishlist
    const r17 = await prisma.wishlistItem.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['WishlistItem', r17.count]);

    // 18. View history
    const r18 = await prisma.viewHistory.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['ViewHistory', r18.count]);

    // 19. AI content logs
    const r19 = await prisma.aIContentLog.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['AIContentLog', r19.count]);

    // 20. Event logs
    const r20 = await prisma.eventLog.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['EventLog', r20.count]);

    // 21. Product variants (via products)
    const testProducts = await prisma.product.findMany({ where: { id: { startsWith: 'TEST_' } }, select: { id: true } });
    if (testProducts.length) {
        const pIds = testProducts.map(p => p.id);
        const r21 = await prisma.productVariant.deleteMany({ where: { productId: { in: pIds } } });
        results.push(['ProductVariant', r21.count]);
    }

    // 22. Products
    const r22 = await prisma.product.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Product', r22.count]);

    // 23. Collections
    const r23 = await prisma.collection.deleteMany({ where: { slug: { startsWith: 'test-' } } });
    results.push(['Collection', r23.count]);

    // 24. Addresses
    const r24 = await prisma.address.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['Address', r24.count]);

    // 25. Partner profiles
    const r25 = await prisma.partnerProfile.deleteMany({ where: { id: { startsWith: 'TEST_' } } });
    results.push(['PartnerProfile', r25.count]);

    // 26. Test users (NOT the admin user)
    const r26 = await prisma.user.deleteMany({
        where: {
            id: { startsWith: 'TEST_' },
            email: { not: 'nguyendinhduy@sieuthimatkinh.vn' },
        },
    });
    results.push(['User (test)', r26.count]);

    // Summary
    console.log('  Cleanup results:');
    let total = 0;
    for (const [model, count] of results) {
        if (count > 0) {
            console.log(`    ✓ ${model}: ${count} deleted`);
            total += count;
        }
    }
    console.log(`\n✅ Cleanup complete! ${total} test records removed.`);
    console.log('   Admin user preserved: nguyendinhduy@sieuthimatkinh.vn\n');
}

cleanup()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
