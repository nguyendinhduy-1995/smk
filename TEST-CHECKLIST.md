# TEST-CHECKLIST.md — SMK v1.0

## A) Môi trường test

| # | Hạng mục | Status |
|---|----------|--------|
| 1 | Seed data: 30 SP, 5 brands, 10 coupons, 20 KH, 10 đối tác, 50 đơn | ✅ |
| 2 | 3 tài khoản: Admin / Store Manager / Staff | ✅ |
| 3 | Vitest + Playwright config | ✅ |

## B) Build Quality

| Lệnh | Kết quả | Ghi chú |
|-------|---------|---------|
| `npm run lint` | ✅ PASS | ESLint `src/` |
| `npm run typecheck` | ✅ 0 errors | `tsc --noEmit` |
| `npm run build` | ✅ exit 0 | Next.js 16 build |
| `npm test` | ✅ 35/35 | Vitest unit tests |
| `npm run test:e2e` | ✅ 27/27 (100%) | Playwright Desktop Chrome |

## C) Business Logic P0

| # | Kiểm tra | Status |
|---|----------|--------|
| 5 | Commission đúng %: Affiliate 5%, Agent 8%, Leader 12% | ✅ Unit test |
| 6 | Commission status flow: PENDING → AVAILABLE → PAID | ✅ Unit test |
| 7 | Attribution: coupon partner > ref link | ✅ Unit test |
| 8 | Inventory: không tồn âm, restore on cancel | ✅ Unit test |
| 9 | Risk score formula + auto-hold > 40 | ✅ Unit test |
| 10 | RBAC: Staff chỉ truy cập orders/customers/support | ✅ Unit test |

## D) Mobile UX

| # | Kiểm tra | Status |
|---|----------|--------|
| 11 | Viewport 375x812: no overflow | ✅ |
| 12 | Viewport 390x844: no overflow | ✅ |
| 13 | Touch targets ≥ 44px | ✅ |
| 14 | Text readable (≥14px body) | ✅ |
| 15 | PDP sticky CTA bar | ✅ Đã có |
| 16 | Cart sticky CTA bar | ✅ Đã thêm |

## E) Admin Pages (20 pages)

| # | Page | Interactive Elements | Status |
|---|------|---------------------|--------|
| 1 | Dashboard | KPI cards, alerts | ✅ |
| 2 | Products | CRUD, inline edit, search, status toggle | ✅ |
| 3 | Lenses | Lens option toggles | ✅ |
| 4 | Orders | Status flow, cancel, detail panel | ✅ |
| 5 | Shipping | Carrier toggles, mode select | ✅ |
| 6 | Returns | Approve/reject | ✅ |
| 7 | Warehouse | Stock adjust, movement log, import | ✅ |
| 8 | Customers | Search, tier filter, sort, detail | ✅ |
| 9 | Support | Assign, resolve, canned responses | ✅ |
| 10 | Reviews | Spam toggle, filter, sort | ✅ |
| 11 | Partners | Approve/reject, suspend, upgrade | ✅ |
| 12 | Commissions | API fetch, release/reverse | ✅ |
| 13 | Commission Tiers | Config table | ✅ |
| 14 | Payouts | Approve/reject/pay | ✅ |
| 15 | Automation | Workflow toggles | ✅ |
| 16 | AI & KB | Feature toggles | ✅ |
| 17 | Analytics | Charts load | ✅ |
| 18 | SEO | CWV monitoring, index toggle | ✅ |
| 19 | Fraud | Block, hold, recalculate | ✅ |
| 20 | Audit | Action filters | ✅ |
| 21 | Users | Full CRUD, permissions, roles | ✅ |
