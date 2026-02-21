import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1) Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@sieuthimatkinh.vn' },
        update: {},
        create: {
            email: 'admin@sieuthimatkinh.vn',
            phone: '0900000000',
            name: 'Admin SMK',
            role: 'ADMIN',
            password: '$2b$10$xnJ0KFvzZzptDWQ0Pncvpu/EErjBzklzkQB2EQWaAD8Bi62T8JMmC', // admin123
        },
    });
    console.log('  ✓ Admin user');

    // 2) Sample customer
    const customer = await prisma.user.upsert({
        where: { email: 'khach@example.com' },
        update: {},
        create: {
            email: 'khach@example.com',
            phone: '0912345678',
            name: 'Nguyễn Văn Khách',
            role: 'CUSTOMER',
        },
    });

    // 3) Sample partner
    const partnerUser = await prisma.user.upsert({
        where: { email: 'duy@example.com' },
        update: {},
        create: {
            email: 'duy@example.com',
            phone: '0987654321',
            name: 'Đại lý Duy',
            role: 'PARTNER',
        },
    });

    const partner = await prisma.partnerProfile.upsert({
        where: { userId: partnerUser.id },
        update: {},
        create: {
            userId: partnerUser.id,
            partnerCode: 'DUY123',
            level: 'AGENT',
            status: 'ACTIVE',
            bankAccount: { bank: 'Vietcombank', accountNumber: '0123456789', accountName: 'NGUYEN VAN DUY' },
            storeName: 'Kính Duy',
        },
    });
    console.log('  ✓ Partner profile');

    // 4) Commission rule (global 10%)
    await prisma.commissionRule.upsert({
        where: { id: 'global-rule' },
        update: {},
        create: {
            id: 'global-rule',
            scope: 'GLOBAL',
            percent: 10,
        },
    });
    console.log('  ✓ Commission rule');

    // 5) Coupon for partner
    await prisma.coupon.upsert({
        where: { code: 'DUY10' },
        update: {},
        create: {
            code: 'DUY10',
            type: 'PERCENT',
            value: 10,
            ownerPartnerId: partner.id,
            startsAt: new Date('2026-01-01'),
            endsAt: new Date('2027-12-31'),
            isActive: true,
        },
    });
    console.log('  ✓ Partner coupon');

    // 6) Products
    const products = [
        {
            name: 'Aviator Classic Gold',
            slug: 'aviator-classic-gold',
            brand: 'Ray-Ban',
            description: 'Gọng kính Aviator huyền thoại với thiết kế kim loại vàng sang trọng. Phù hợp cho mọi khuôn mặt.',
            frameShape: 'AVIATOR' as const,
            material: 'METAL' as const,
            faceShape: ['Mặt vuông', 'Mặt dài', 'Oval'],
            style: ['Sang trọng', 'Basic', 'Công sở'],
            gender: 'UNISEX' as const,
            lensWidth: 55,
            bridge: 14,
            templeLength: 135,
            tags: ['aviator', 'vàng', 'classic', 'ray-ban'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'RB-AVI-GOLD-55', frameColor: 'Vàng', lensColor: 'Xanh lá', price: 2990000, compareAtPrice: 3590000, stockQty: 15 },
                { sku: 'RB-AVI-SILVER-55', frameColor: 'Bạc', lensColor: 'Xám', price: 2990000, compareAtPrice: 3590000, stockQty: 8 },
                { sku: 'RB-AVI-BLACK-55', frameColor: 'Đen', lensColor: 'Xanh dương', price: 3190000, stockQty: 3 },
            ],
        },
        {
            name: 'Cat-Eye Acetate Tortoise',
            slug: 'cat-eye-acetate-tortoise',
            brand: 'Tom Ford',
            description: 'Gọng Cat-Eye từ acetate Ý cao cấp, màu tortoise sang trọng. Hoàn hảo cho phong cách retro.',
            frameShape: 'CAT_EYE' as const,
            material: 'ACETATE' as const,
            faceShape: ['Mặt tròn', 'Mặt vuông', 'Trái tim'],
            style: ['Sang trọng', 'Retro', 'Cá tính'],
            gender: 'FEMALE' as const,
            lensWidth: 52,
            bridge: 16,
            templeLength: 140,
            tags: ['cat-eye', 'tortoise', 'acetate', 'tom-ford', 'nữ'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'TF-CE-TORT-52', frameColor: 'Tortoise', lensColor: 'Nâu', price: 4590000, stockQty: 12 },
                { sku: 'TF-CE-BLACK-52', frameColor: 'Đen', lensColor: 'Xám đậm', price: 4590000, stockQty: 6 },
            ],
        },
        {
            name: 'Round Titanium Silver',
            slug: 'round-titanium-silver',
            brand: 'Lindberg',
            description: 'Gọng tròn siêu nhẹ từ titanium Đan Mạch. Trọng lượng chỉ 3.9g, thiết kế tối giản.',
            frameShape: 'ROUND' as const,
            material: 'TITANIUM' as const,
            faceShape: ['Mặt vuông', 'Mặt dài', 'Oval'],
            style: ['Basic', 'Công sở', 'Sang trọng'],
            gender: 'UNISEX' as const,
            lensWidth: 48,
            bridge: 19,
            templeLength: 145,
            tags: ['tròn', 'titanium', 'siêu nhẹ', 'lindberg'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'LB-RND-SIL-48', frameColor: 'Bạc', price: 8990000, compareAtPrice: 9990000, stockQty: 5 },
                { sku: 'LB-RND-GOLD-48', frameColor: 'Vàng hồng', price: 9290000, stockQty: 3 },
            ],
        },
        {
            name: 'Square TR90 Black',
            slug: 'square-tr90-black',
            brand: 'Oakley',
            description: 'Gọng vuông thể thao từ TR90, siêu bền và linh hoạt. Phù hợp vận động.',
            frameShape: 'SQUARE' as const,
            material: 'TR90' as const,
            faceShape: ['Mặt tròn', 'Oval'],
            style: ['Thể thao', 'Basic', 'Cá tính'],
            gender: 'MALE' as const,
            lensWidth: 56,
            bridge: 17,
            templeLength: 138,
            tags: ['vuông', 'tr90', 'thể thao', 'oakley'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'OAK-SQ-BLK-56', frameColor: 'Đen', price: 3290000, stockQty: 20 },
                { sku: 'OAK-SQ-NVY-56', frameColor: 'Xanh navy', price: 3290000, stockQty: 10 },
            ],
        },
        {
            name: 'Browline Mixed Gold-Black',
            slug: 'browline-mixed-gold-black',
            brand: 'Persol',
            description: 'Gọng Browline kết hợp kim loại vàng và acetate đen. Phong cách quý ông.',
            frameShape: 'BROWLINE' as const,
            material: 'MIXED' as const,
            faceShape: ['Mặt tròn', 'Oval', 'Trái tim'],
            style: ['Sang trọng', 'Công sở', 'Retro'],
            gender: 'MALE' as const,
            lensWidth: 51,
            bridge: 20,
            templeLength: 145,
            tags: ['browline', 'mixed', 'vàng', 'persol', 'nam'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'PS-BRW-GDB-51', frameColor: 'Vàng/Đen', price: 5490000, compareAtPrice: 6290000, stockQty: 7 },
            ],
        },
        {
            name: 'Oval Acetate Crystal Pink',
            slug: 'oval-acetate-crystal-pink',
            brand: 'Celine',
            description: 'Gọng oval từ acetate trong suốt hồng pastel, nữ tính và đầy cá tính.',
            frameShape: 'OVAL' as const,
            material: 'ACETATE' as const,
            faceShape: ['Mặt vuông', 'Mặt dài'],
            style: ['Cá tính', 'Retro'],
            gender: 'FEMALE' as const,
            lensWidth: 50,
            bridge: 18,
            templeLength: 140,
            tags: ['oval', 'acetate', 'hồng', 'celine', 'nữ'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'CEL-OV-PINK-50', frameColor: 'Hồng crystal', price: 6790000, stockQty: 8 },
                { sku: 'CEL-OV-BLUE-50', frameColor: 'Xanh crystal', price: 6790000, stockQty: 4 },
            ],
        },
        {
            name: 'Geometric Titanium Rose',
            slug: 'geometric-titanium-rose',
            brand: 'Miu Miu',
            description: 'Gọng hình học từ titanium vàng hồng, thiết kế độc đáo và nổi bật.',
            frameShape: 'GEOMETRIC' as const,
            material: 'TITANIUM' as const,
            faceShape: ['Mặt tròn', 'Oval'],
            style: ['Cá tính', 'Sang trọng'],
            gender: 'FEMALE' as const,
            lensWidth: 53,
            bridge: 15,
            templeLength: 140,
            tags: ['hình học', 'titanium', 'vàng hồng', 'miu-miu'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'MM-GEO-ROSE-53', frameColor: 'Vàng hồng', price: 7290000, compareAtPrice: 7990000, stockQty: 6 },
            ],
        },
        {
            name: 'Rectangle Metal Gunmetal',
            slug: 'rectangle-metal-gunmetal',
            brand: 'Hugo Boss',
            description: 'Gọng chữ nhật kim loại gunmetal, thanh lịch và chuyên nghiệp.',
            frameShape: 'RECTANGLE' as const,
            material: 'METAL' as const,
            faceShape: ['Mặt tròn', 'Oval', 'Trái tim'],
            style: ['Công sở', 'Basic'],
            gender: 'MALE' as const,
            lensWidth: 54,
            bridge: 16,
            templeLength: 140,
            tags: ['chữ nhật', 'kim loại', 'gunmetal', 'hugo-boss', 'nam'],
            status: 'ACTIVE' as const,
            variants: [
                { sku: 'HB-REC-GUN-54', frameColor: 'Gunmetal', price: 2490000, stockQty: 18 },
                { sku: 'HB-REC-BLK-54', frameColor: 'Đen matte', price: 2490000, stockQty: 12 },
            ],
        },
    ];

    for (const p of products) {
        const { variants, ...productData } = p;
        const product = await prisma.product.upsert({
            where: { slug: p.slug },
            update: {},
            create: {
                ...productData,
                variants: {
                    create: variants,
                },
            },
        });
        console.log(`  ✓ Product: ${product.name}`);
    }

    // 7) Collections
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
        await prisma.collection.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
    }
    console.log('  ✓ Collections');

    console.log('\\n✅ Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
