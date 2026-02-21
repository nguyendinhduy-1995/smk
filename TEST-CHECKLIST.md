# TEST-CHECKLIST.md — Siêu Thị Mắt Kính

## Storefront (Customer-facing)

### Homepage (`/`)
- [x] Style cards render (Sang Trọng / Trẻ Trung / Công Sở)
- [x] "Thử Kính Online" CTA visible
- [x] Product cards render with "Mua ngay ⚡" Quick Buy
- [x] Flash Sale countdown banner works
- [x] Top sellers horizontal scroll
- [x] Budget filter chips clickable
- [x] SocialProof popup appears after 8s
- [x] No horizontal overflow on mobile (375×812)

### Search / Category (`/search`, `/c/[slug]`)
- [x] Quick filter chips render (Bán chạy, Mới về, Sale...)
- [x] Product grid renders
- [x] Active filter summary line
- [x] "Xóa lọc" resets filters

### Product Detail (`/p/[slug]`)
- [x] Gallery renders (placeholder SVG)
- [x] Price + compare-at visible
- [x] Variant picker functional
- [x] Sticky bottom CTA bar (MUA NGAY + Thêm giỏ)
- [x] Share button works
- [x] ReviewWithPhotos renders
- [x] ProductReviews renders
- [x] RecentlyViewed bar tracks views

### Cart (`/cart`)
- [x] Cart items display
- [x] Quantity +/- works
- [x] Empty state visible when no items
- [x] "Thanh toán" CTA to checkout

### Checkout (`/checkout`)
- [x] Auto-fill from localStorage
- [x] Form validation (name, phone, email, address)
- [x] VoucherSuggest widget renders
- [x] Step 1 (info) → Step 2 (confirm) flow
- [x] Sticky CTA bar (Tổng + Tiếp tục / Đặt hàng)
- [x] Mobile keyboard does not break layout

### Orders (`/orders`)
- [x] Demo orders list renders
- [x] Status badges (Đã tạo, Đang giao, Đã giao)
- [x] "Mua lại 🔄" button on DELIVERED orders

### Try-On (`/try-on`)
- [x] Camera access prompt
- [x] Frame overlay system

### Quiz (`/quiz`)
- [x] 3-step flow renders (mặt → style → budget)
- [x] Progress bar updates
- [x] Result cards with product suggestions
- [x] "Làm lại Quiz" + "Thử kính online" buttons

### Blog (`/blog`)
- [x] 4 articles render with categories
- [x] Read time displayed

### Loyalty (`/loyalty`)
- [x] 4-tier system (Thành viên → Kim Cương)
- [x] Progress bar, discount tiers

### Bundle (`/bundle`)
- [x] 3 combo cards (Cơ Bản / Chống Sáng Xanh / Premium)
- [x] Savings displayed

---

## Partner Portal

### Dashboard (`/partner/dashboard`)
- [x] 3 stat cards (HH, Đơn, Pending)
- [x] Smart Link copy widget
- [x] Quick links grid
- [x] Recent orders list

### Links (`/partner/links`)
- [x] Featured Smart Link card
- [x] 4 ref links with copy
- [x] QR code canvas generation + download
- [x] Coupon codes with copy

### Toolkit (`/partner/toolkit`)
- [x] Marketing kit with captions + hashtags

### Store (`/partner/store/[code]`)
- [x] Mini-store catalog

### Smart Link Redirect (`/s/[code]`)
- [x] Redirects to partner store with ?ref=smartlink

---

## Admin Panel

### Dashboard (`/admin`)
- [x] 6 stat cards render
- [x] 7-day revenue chart (SVG bars)
- [x] AI Forecast card (Dự báo AI)
- [x] Pending orders list
- [x] Partner alerts
- [x] Top products
- [x] Payout requests

### Products (`/admin/products`)
- [x] Product list with search
- [x] Variant management

### Orders (`/admin/orders`)
- [x] Order list with status filter
- [x] Order detail view

### Login (`/admin/login`)
- [x] Login form renders
- [x] JWT session management

---

## API Routes

### Auth
- [x] `POST /api/auth/admin/login` — JWT sign + cookie set
- [x] `POST /api/auth/admin/logout` — cookie clear

### Products
- [x] `GET /api/products` — product listing
- [x] `GET/POST /api/products/reviews` — reviews CRUD

### Orders
- [x] `GET /api/orders` — order listing
- [x] `POST /api/orders` — create order

### Partner
- [x] `GET/POST /api/partner/auto-payout` — auto-payout system
- [x] `GET /api/partner/analytics` — partner stats

### Admin
- [x] `GET /api/admin/shipping` — shipping management

---

## Cross-cutting

### Performance
- [x] No "Maximum update depth exceeded" (FlashSale fixed)
- [x] Images use lazy loading placeholders
- [x] No layout shift on mobile

### Accessibility
- [x] Touch targets ≥ 44px on mobile
- [x] aria-labels on icon buttons

### Security
- [x] JWT session with HMAC-SHA256
- [x] HttpOnly cookies for admin session
- [x] RBAC permission checks in admin layout

### Responsive
- [x] 375×812 viewport — no overflow
- [x] 390×844 viewport — no overflow
- [x] Desktop 1440px — proper grid layout
