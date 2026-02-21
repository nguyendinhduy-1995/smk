# E2E Test Report — SMK v1.0

> Date: 2026-02-21 · Framework: Playwright · Total: 42 tests

## Summary

| Group | Count | Expected Pass |
|-------|-------|---------------|
| Customer Shopping Flow | 7 | 7/7 |
| Partner Portal | 5 | 5/5 |
| Admin Core Functions | 12 | 12/12 |
| Mobile UX | 3 | 3/3 |
| Product Wizard | 6 | 6/6 |
| Inventory Ledger | 4 | 4/4 |
| Checkout & Attribution | 2 | 2/2 |
| API Tests | 3 | 3/3 |
| **Total** | **42** | **42/42** |

## Test Cases

### Customer Shopping (TC01–TC07)
| # | Test | Assertions |
|---|------|-----------|
| TC01 | Home page loads with hero | Title matches, h1/h2 visible |
| TC02 | Category/Search page loads | Body content > 100 chars |
| TC03 | PDP loads product details | h1 contains "Aviator" |
| TC04 | Cart add/remove flow | Cart page visible |
| TC05 | Wishlist page loads | Body visible |
| TC06 | Account page loads | Body visible |
| TC07 | FAQ page has content | Content > 200 chars |

### Partner Portal (TC08–TC12)
| # | Test | Assertions |
|---|------|-----------|
| TC08 | Dashboard loads | Body visible |
| TC09 | Links page loads | Body visible |
| TC10 | Analytics page loads | Body visible |
| TC11 | Wallet page loads | Body visible |
| TC12 | Notifications page loads | Body visible |

### Admin Core (TC13–TC24)
| # | Test | Assertions |
|---|------|-----------|
| TC13 | Dashboard KPI cards | stat-card/card/form count > 0 |
| TC14 | Products — add form | Name input visible after click |
| TC15 | Products — search filter | Rows > 0 after "Aviator" search |
| TC16 | Orders — status filter | Filter buttons visible |
| TC17 | Orders — view detail | Body text > 100 chars |
| TC18 | Partners — approve | Toast "Đã duyệt" |
| TC19 | Warehouse — tab switch | Tab visible and clickable |
| TC20 | Commissions page | Body visible |
| TC21 | Fraud — recalculate | Loading state appears |
| TC22 | Users RBAC page | Body visible |
| TC23 | Audit log page | Buttons > 0 |
| TC24 | Support — ticket action | Toast "Đã nhận" |

### Product Wizard (TC28–TC33)
| # | Test | Assertions |
|---|------|-----------|
| TC28 | Wizard loads with 5 steps | h1 "Đăng sản phẩm", 5 step buttons |
| TC29 | B1 Info form fields | Name input + selects visible |
| TC30 | Step navigation works | "Bước sau" → shows "Hình ảnh" |
| TC31 | Publish validation blocks | "Không thể publish" on empty |
| TC32 | AI Content Studio visible | Studio block + tone select |
| TC33 | Eyewear specs expandable | Details toggle → AVIATOR option |

### Inventory Ledger (TC34–TC37)
| # | Test | Assertions |
|---|------|-----------|
| TC34 | Warehouse loads with tabs | "Tồn kho" + "Phiếu" buttons |
| TC35 | Stock overview shows items | Table rows > 0 |
| TC36 | Create voucher dialog | Modal with type select |
| TC37 | CSV export button | "Xuất CSV" button visible |

### Checkout & Attribution (TC38–TC39)
| # | Test | Assertions |
|---|------|-----------|
| TC38 | Checkout page loads | Body text > 50 chars |
| TC39 | Cart sticky CTA mobile | .sticky-cta-bar in DOM |

### API Tests (TC40–TC42)
| # | Test | Assertions |
|---|------|-----------|
| TC40 | GET /api/admin/products | 200, has products + pagination |
| TC41 | POST /api/admin/products | 201, has id, status DRAFT |
| TC42 | GET /api/admin/products/bulk | 200, content-type text/csv |

### Mobile UX (TC25–TC27)
| # | Test | Assertions |
|---|------|-----------|
| TC25 | Home no overflow (375px) | scrollWidth ≤ clientWidth + 5 |
| TC26 | PDP no overflow | scrollWidth ≤ clientWidth + 5 |
| TC27 | Admin responsive | scrollWidth ≤ clientWidth + 20 |

## Unit Tests

| Suite | Tests | Result |
|-------|-------|--------|
| business-logic.test.ts | 35 | ✅ Pass |
| Commission rates | 5 | ✅ |
| Fraud detection | 5 | ✅ |
| Partner attribution | 5 | ✅ |
| Inventory logic | 10 | ✅ |
| RBAC permissions | 10 | ✅ |

## Build Verification

```
✅ TypeCheck: 0 errors
✅ Build: exit 0
✅ Lint: pass (eslint-config-next)
```
