# RECOMMENDATIONS.md — Siêu Thị Mắt Kính

## P0 — Critical (Fix trước khi launch)

### 1. Real product images
- Hiện tại dùng placeholder SVG — không thể bán hàng thực tế
- **Action:** Upload ảnh sản phẩm thật, tích hợp CDN (Cloudinary / Vercel Image Optimization)
- **Effort:** 2-4 giờ

### 2. Payment gateway integration
- QRPayment component chỉ là placeholder — chưa kết nối VNPay/MoMo/ZaloPay thật
- **Action:** Đăng ký merchant account, tích hợp SDK thanh toán
- **Effort:** 1-2 ngày

### 3. Database seeding / real data
- Admin dashboard + product list dùng demo data hoặc fallback khi DB trống
- **Action:** Seed database với sản phẩm, categories, variants thật
- **Effort:** 1-2 giờ

---

## P1 — Important (Nên fix trước khi marketing)

### 4. Push notifications (Firebase/OneSignal)
- Component "Nhắc đổi kính" cần service worker thật
- **Action:** Setup Firebase Cloud Messaging hoặc OneSignal
- **Effort:** 4-8 giờ

### 5. GA4 measurement setup
- `analytics-events.ts` sẵn code tracking nhưng chưa gắn GA Measurement ID
- **Action:** Tạo GA4 property, thêm `<Script>` tag vào `layout.tsx`
- **Effort:** 30 phút

### 6. SSL + custom domain
- Deploy production cần HTTPS + domain thật (e.g. `sieuthimatkinh.vn`)
- **Action:** Vercel deploy hoặc Docker + nginx + certbot
- **Effort:** 1-2 giờ

### 7. E-mail transactional
- Order confirmation, shipping update, welcome email chưa có
- **Action:** Tích hợp Resend / SendGrid cho email templates
- **Effort:** 4-6 giờ

---

## P2 — Nice to Have

### 8. Image optimization
- Thêm `next/image` thay vì `<img>` tag thường
- WebP/AVIF auto-conversion, responsive sizes
- **Effort:** 2-3 giờ

### 9. ESLint cleanup
- 29 remaining warnings (setState-in-effect, unescaped entities)
- Chủ yếu cosmetic, không ảnh hưởng runtime
- **Effort:** 1-2 giờ

### 10. E2E Playwright tests
- Viết Playwright tests tự động cho: login, checkout flow, order management
- Chạy CI/CD pipeline
- **Effort:** 1-2 ngày

### 11. Performance monitoring
- Web Vitals (LCP, CLS, FID) tracking
- Error boundary reporting (Sentry)
- **Effort:** 2-4 giờ

### 12. SEO enhancements
- Sitemap.xml dynamic generation
- Structured data (JSON-LD) for products
- OG meta tags per product page
- **Effort:** 2-4 giờ

---

## Architecture Notes

### Strengths ✅
- Clean Next.js App Router architecture
- Zustand stores for client state (cart, UI)
- Prisma ORM with proper schema
- RBAC with JWT auth for admin
- Commission engine with proper attribution priority
- Vietnamese-first UI (100% localized)

### Areas for Improvement
- Server Actions could replace some API routes
- React Server Components underutilized (many pages `'use client'`)
- Caching strategy (ISR for product pages, SWR for dashboard data)
- Rate limiting on API routes (basic implementation exists)
