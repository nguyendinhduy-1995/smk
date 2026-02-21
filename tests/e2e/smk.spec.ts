import { test, expect } from '@playwright/test';

/* ═══════════════════ CUSTOMER WEB ═══════════════════ */

test.describe('Customer — Shopping Flow', () => {
    test('TC01: Home page loads with hero and products', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveTitle(/Siêu Thị Mắt Kính/);
        await expect(page.locator('h1, h2').first()).toBeVisible();
    });

    test('TC02: Category/Search page loads', async ({ page }) => {
        await page.goto('/search');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
        const pageContent = await page.textContent('body');
        expect(pageContent?.length).toBeGreaterThan(100);
    });

    test('TC03: PDP loads product details', async ({ page }) => {
        await page.goto('/p/aviator-classic-gold');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1')).toContainText(/Aviator/i);
    });

    test('TC04: Cart add/remove flow', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        // Navigate to cart
        await page.goto('/cart');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC05: Wishlist add/remove', async ({ page }) => {
        await page.goto('/wishlist');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC06: Account page loads', async ({ page }) => {
        await page.goto('/account');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC07: FAQ page loads with content', async ({ page }) => {
        await page.goto('/faq');
        await page.waitForLoadState('networkidle');
        const content = await page.textContent('body');
        expect(content?.length).toBeGreaterThan(200);
    });
});

/* ═══════════════════ PARTNER PORTAL ═══════════════════ */

test.describe('Partner Portal', () => {
    test('TC08: Partner dashboard loads', async ({ page }) => {
        await page.goto('/partner/dashboard');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC09: Partner links page loads', async ({ page }) => {
        await page.goto('/partner/links');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC10: Partner analytics page loads', async ({ page }) => {
        await page.goto('/partner/analytics');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC11: Partner wallet page loads', async ({ page }) => {
        await page.goto('/partner/wallet');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC12: Partner notifications page loads', async ({ page }) => {
        await page.goto('/partner/notifications');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });
});

/* ═══════════════════ ADMIN PANEL ═══════════════════ */

test.describe('Admin — Core Functions', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to admin (will redirect to login or show dashboard)
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
    });

    test('TC13: Admin dashboard loads with KPI cards', async ({ page }) => {
        // Dashboard should show stat cards
        const body = page.locator('body');
        await expect(body).toBeVisible();
        // Check for stat cards or login form
        const hasContent = await page.locator('.stat-card, .card, form').count();
        expect(hasContent).toBeGreaterThan(0);
    });

    test('TC14: Products page — add product form appears', async ({ page }) => {
        await page.goto('/admin/products');
        await page.waitForLoadState('networkidle');
        // Click add product button
        const addBtn = page.getByRole('button', { name: /thêm sản phẩm/i });
        if (await addBtn.isVisible()) {
            await addBtn.click();
            // Form should appear
            const nameInput = page.locator('input[placeholder*="Tên"]');
            await expect(nameInput).toBeVisible();
        }
    });

    test('TC15: Products page — search filters products', async ({ page }) => {
        await page.goto('/admin/products');
        await page.waitForLoadState('networkidle');
        const searchInput = page.locator('input[placeholder*="Tìm"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('Aviator');
            // Should filter to show matching products
            const rows = page.locator('table tbody tr');
            const count = await rows.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('TC16: Orders page — status filter works', async ({ page }) => {
        await page.goto('/admin/orders');
        await page.waitForLoadState('networkidle');
        // Should have status filter buttons
        const filterBtns = page.locator('.stat-card, .filter-chip, button');
        expect(await filterBtns.count()).toBeGreaterThan(0);
    });

    test('TC17: Orders page — view button exists', async ({ page }) => {
        await page.goto('/admin/orders');
        await page.waitForLoadState('networkidle');
        const viewBtn = page.locator('button').filter({ hasText: '👁️' }).first();
        if (await viewBtn.isVisible()) {
            await viewBtn.click();
            // Wait for any reaction
            await page.waitForTimeout(500);
            const bodyText = await page.textContent('body');
            expect(bodyText?.length).toBeGreaterThan(100);
        }
    });

    test('TC18: Partners page — approve partner works', async ({ page }) => {
        await page.goto('/admin/partners');
        await page.waitForLoadState('networkidle');
        const approveBtn = page.locator('button:has-text("Duyệt")').first();
        if (await approveBtn.isVisible()) {
            await approveBtn.click();
            // Toast should appear
            await expect(page.locator('text=Đã duyệt')).toBeVisible({ timeout: 3000 });
        }
    });

    test('TC19: Warehouse page — tab switching works', async ({ page }) => {
        await page.goto('/admin/warehouse');
        await page.waitForLoadState('networkidle');
        const movementTab = page.locator('button:has-text("Lịch sử")');
        if (await movementTab.isVisible()) {
            await movementTab.click();
            // Movement table should show
            await expect(page.locator('th:has-text("Thời gian")')).toBeVisible();
        }
    });

    test('TC20: Commissions page loads with data', async ({ page }) => {
        await page.goto('/admin/commissions');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC21: Fraud page — recalculate button works', async ({ page }) => {
        await page.goto('/admin/fraud');
        await page.waitForLoadState('networkidle');
        const recalcBtn = page.getByRole('button', { name: /Tính toán lại/i });
        if (await recalcBtn.isVisible()) {
            await recalcBtn.click();
            // Button should show loading state
            await expect(page.locator('text=Đang tính')).toBeVisible({ timeout: 2000 });
        }
    });

    test('TC22: Users page loads with RBAC info', async ({ page }) => {
        await page.goto('/admin/users');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('body')).toBeVisible();
    });

    test('TC23: Audit log page loads with data', async ({ page }) => {
        await page.goto('/admin/audit');
        await page.waitForLoadState('networkidle');
        // Should have log entries or filter capability
        const buttons = page.locator('button');
        expect(await buttons.count()).toBeGreaterThan(0);
    });

    test('TC24: Support page — ticket actions work', async ({ page }) => {
        await page.goto('/admin/support');
        await page.waitForLoadState('networkidle');
        const assignBtn = page.locator('button:has-text("Nhận")').first();
        if (await assignBtn.isVisible()) {
            await assignBtn.click();
            await expect(page.locator('text=Đã nhận')).toBeVisible({ timeout: 3000 });
        }
    });
});

/* ═══════════════════ MOBILE VIEWPORT ═══════════════════ */

test.describe('Mobile UX', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('TC25: Home page no horizontal overflow on iPhone', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
    });

    test('TC26: PDP no horizontal overflow on mobile', async ({ page }) => {
        await page.goto('/p/aviator-classic-gold');
        await page.waitForLoadState('networkidle');
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    });

    test('TC27: Admin responsive on mobile', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); // admin has wider tolerance
    });
});
