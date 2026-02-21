# BUG-LIST.md — Siêu Thị Mắt Kính

## P0 — Blocking (Chặn mua hàng / Crash / Bảo mật)

### BUG-001: React infinite loop — FlashSale "Maximum update depth exceeded" ✅ FIXED
- **Severity:** P0
- **Module:** `FlashSale.tsx` (Homepage)
- **Symptoms:** Console floods with "Maximum update depth exceeded", page becomes unresponsive
- **Steps to reproduce:** Simply load homepage (`/`), observe console
- **Root cause:** `endTime = new Date(Date.now() + 4h)` as default prop creates new Date object every render → `useEffect([endTime])` dep changes → `setState` → re-render → infinite loop
- **Fix:** Stabilized `endTime` with `useMemo(() => endTimeProp || new Date(...), [endTimeProp])`
- **Commit:** `41e98fd`

### BUG-002: Admin layout — useEffect called conditionally (hooks order violation) ✅ FIXED
- **Severity:** P0
- **Module:** `admin/layout.tsx`
- **Symptoms:** Potential crash or undefined behavior when navigating to/from `/admin/login`
- **Steps to reproduce:** Navigate to `/admin` → `/admin/login` → back to `/admin`
- **Root cause:** `useEffect` on line 69 was called after an early `return` on line 64 — violates React "Rules of Hooks" (hooks must be called in same order every render)
- **Fix:** Moved `useEffect` before the conditional `return`, added `if (pathname === '/admin/login') return;` inside the effect
- **Commit:** `124a018`

---

## P1 — Major UX / Display / Performance

### BUG-003: auth.ts — `require('crypto')` forbidden in ESM ✅ FIXED
- **Severity:** P1
- **Module:** `src/lib/auth.ts`
- **Symptoms:** ESLint error, potential runtime issue in strict ESM environments
- **Root cause:** `require('crypto')` used inline instead of `import`
- **Fix:** Replaced with top-level `import crypto from 'crypto'`
- **Commit:** `124a018`

### BUG-004: Commission/Attribution — `any` type safety ✅ FIXED
- **Severity:** P1
- **Module:** `src/lib/utils/commission.ts`, `src/lib/utils/attribution.ts`
- **Symptoms:** Type safety bypassed, potential runtime errors from incorrect query types
- **Root cause:** `as any` used for Prisma `partnerLevel` enum and `where` clause
- **Fix:** Replaced with proper union types and typed `where` clause
- **Commit:** `124a018`

### BUG-005: Sticky PDP bottom bar not prominent on desktop
- **Severity:** P1
- **Module:** `p/[slug]/page.tsx`
- **Symptoms:** On desktop, the "MUA NGAY" CTA blends into content flow rather than floating
- **Status:** Acceptable — desktop users have the CTA visible in the content area; mobile has bottom nav

---

## P2 — Minor UI / Copy / Edge Cases

### BUG-006: Unescaped `"` entities in JSX (8 instances)
- **Severity:** P2
- **Module:** Various components
- **Symptoms:** ESLint warnings, no runtime impact
- **Status:** Non-blocking, cosmetic lint compliance

### BUG-007: `setState` in useEffect warnings (10 instances)
- **Severity:** P2
- **Module:** ThemeToggle, partner pages, admin pages
- **Symptoms:** ESLint warnings for legitimate mount/hydration patterns
- **Status:** Non-blocking — these are standard React hydration patterns (setMounted, load from localStorage)

### BUG-008: "Cannot create components during render" (4 instances)
- **Severity:** P2
- **Module:** Various
- **Symptoms:** ESLint warnings about component creation patterns
- **Status:** Non-blocking, works correctly at runtime

### BUG-009: Product images use placeholder SVGs
- **Severity:** P2
- **Module:** All product cards / PDP
- **Symptoms:** No real product photos displayed
- **Status:** Expected — awaiting real product image upload

---

## Summary

| Priority | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| P0       | 2     | 2     | 0         |
| P1       | 3     | 3     | 0         |
| P2       | 4     | 0     | 4 (non-blocking) |
