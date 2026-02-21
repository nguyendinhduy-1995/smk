# BUG-LIST.md — SMK v1.0

## Bug Summary

| Priority | Found | Fixed | Open |
|----------|-------|-------|------|
| P0 | 7 | 7 | 0 |
| P1 | 4 | 4 | 0 |
| P2 | 2 | 2 | 0 |
| **Total** | **13** | **13** | **0** |

---

## P0 Bugs (chặn mua hàng / sai tồn / sai hoa hồng / crash)

### BUG-001: Products page — Add/Edit buttons không hoạt động
- **Reproduce:** Admin → Sản phẩm → Click "➕ Thêm sản phẩm" hoặc "✏️"
- **Root cause:** onClick handler thiếu, chỉ render UI tĩnh
- **Fix:** Implement full CRUD form, inline edit price/stock, status toggle
- **Commit:** `9f3c903`

### BUG-002: Orders page — Status progression không hoạt động
- **Reproduce:** Admin → Đơn hàng → Click "✓" (confirm) hoặc "📦" (ship)
- **Root cause:** Button không có onClick, trạng thái không thay đổi
- **Fix:** Status flow Mới→XN→Giao→Đã giao, cancel, detail panel
- **Commit:** `9f3c903`

### BUG-003: Payouts page — Approve/Pay không hoạt động
- **Reproduce:** Admin → Chi trả → Click "✓ Duyệt" hoặc "💸 Thanh toán"
- **Root cause:** Button onClick handlers thiếu
- **Fix:** Approve/reject-with-reason, mark-paid, status filters
- **Commit:** `9f3c903`

### BUG-004: Partners page — Approve không hoạt động
- **Reproduce:** Admin → Đối tác → Click "✅ Duyệt" on pending partner
- **Root cause:** Button chỉ render, không có logic
- **Fix:** Approve/reject, suspend/reactivate, upgrade levels
- **Commit:** `9f3c903`

### BUG-005: Fraud page — Block/Recalculate không hoạt động
- **Reproduce:** Admin → Chống gian lận → Click "🔄 Tính toán lại"
- **Root cause:** Buttons không có logic thay đổi state
- **Fix:** Block/unblock, hold/release, recalculate formula
- **Commit:** `9f3c903`

### BUG-006: Warehouse page — Stock adjust / Import không hoạt động
- **Reproduce:** Admin → Kho hàng → Click "Import" hoặc adjust stock
- **Root cause:** Import và adjust thiếu handler
- **Fix:** Prompt-based stock adjust, movement log, import info
- **Commit:** `9f3c903`

### BUG-007: Cart page — Thiếu sticky checkout bar trên mobile
- **Reproduce:** Mở Cart trên mobile 375px → cuộn xuống
- **Root cause:** Chỉ PDP có sticky CTA, Cart không có
- **Fix:** Thêm `sticky-cta-bar` component cho Cart
- **Commit:** Current session

---

## P1 Bugs

### BUG-008: Customers page — Search/filter không hoạt động
- **Fix:** Working search, tier filter (VIP/Gold/Silver/New), sort, detail panel

### BUG-009: TypeScript errors in seed.ts (5 errors)
- **Fix:** Proper Prisma enum imports, schema-matching field names

### BUG-010: Missing typecheck/test scripts in package.json
- **Fix:** Added typecheck, test, test:e2e, seed scripts

### BUG-011: Commission logic — Global 10% thay vì per-level
- **Fix:** Commission rules: Affiliate 5%, Agent 8%, Leader 12%

---

## P2 Bugs

### BUG-012: ESLint not scoped to src/
- **Fix:** Changed `"lint": "eslint"` → `"lint": "eslint src/"`

### BUG-013: Seed data thiếu — chỉ 8 products, 1 admin
- **Fix:** Expanded to 30 products, 20 customers, 10 partners, 50 orders, 3 admins
