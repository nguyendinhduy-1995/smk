# Storefront UX Audit — Siêu Thị Mắt Kính

> Date: 2026-02-21 | Viewport: 375×812 (iPhone SE), 390×844 (iPhone 14)

## QA Results

| Check | Result |
|-------|--------|
| `next build` | ✅ Exit 0 |
| `tsc --noEmit` | ✅ Exit 0 |
| ESLint (storefront files) | ✅ 0 errors |

---

## Page-by-Page Audit

| Page | Thumb CTA | ≥44px Targets | No X-Overflow | Sticky Bar | Skeleton | Status |
|------|-----------|---------------|---------------|------------|----------|--------|
| Home | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| Search | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| Category | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| PDP | ✅ | ✅ | ✅ | ✅ | — | ✅ PASS |
| Cart | ✅ | ✅ | ✅ | ✅ | — | ✅ PASS |
| Checkout | ✅ | ✅ | ✅ | ✅ | — | ✅ PASS |
| Track | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| Account | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| Orders | ✅ | ✅ | ✅ | — | — | ✅ PASS |
| Wishlist | ✅ | ✅ | ✅ | — | — | ✅ PASS |

---

## One-Hand Flow Checklist

| Step | Action | Thumb Zone | Result |
|------|--------|------------|--------|
| 1 | Open Home | ✅ Hero CTA 44px | ✅ |
| 2 | Tap Search | ✅ Header search bar expanded | ✅ |
| 3 | Browse category | ✅ Quick filter chips 44px | ✅ |
| 4 | Open PDP | ✅ Swipe gallery, accordion | ✅ |
| 5 | Select variant | ✅ sf-chip 44px | ✅ |
| 6 | Add to cart | ✅ Sticky bar bottom 44px | ✅ |
| 7 | View cart | ✅ sf-qty 44px ±, freeship bar | ✅ |
| 8 | Checkout | ✅ 2-step, autofill, validation | ✅ |
| 9 | Place order | ✅ Sticky bar "Đặt hàng" 44px | ✅ |
| 10 | Track order | ✅ 48px input, timeline | ✅ |

---

## Issues Found & Fixed

| Issue | Before | After |
|-------|--------|-------|
| Checkout 4 steps | 4 screens | 2 screens |
| Qty buttons 32px | Below 44px minimum | `sf-qty` 44px |
| No bottom-sheet filters | Sidebar only | `sf-sheet` overlay |
| Header search hidden on mobile | Small icon only | Full inline search bar |
| Wishlist remove 32px | Below minimum | 44px tap target |
| No freeship progress | Missing | `sf-freeship` bar |
| No form validation | Missing | Auto-focus + real-time |
| No autofill | Missing | HTML `autoComplete` |

---

## CSS Components Added

`sf-qty` · `sf-sheet` · `sf-chip` · `sf-freeship` · `sf-skeleton` · `sf-accordion` · `sf-form-group` · `sf-product-grid` · `sf-gallery` · `sf-timeline` · `sf-steps`
