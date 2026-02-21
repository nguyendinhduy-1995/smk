# FIX-LOG.md — Siêu Thị Mắt Kính

## Fix Summary

| # | Bug ID | Severity | File(s) | Commit | Description |
|---|--------|----------|---------|--------|-------------|
| 1 | BUG-001 | P0 | `src/components/FlashSale.tsx` | `41e98fd` | FlashSale infinite loop — `new Date()` default prop → useMemo stabilization |
| 2 | BUG-002 | P0 | `src/app/admin/layout.tsx` | `124a018` | Conditional useEffect before conditional return — hooks order violation |
| 3 | BUG-003 | P1 | `src/lib/auth.ts` | `124a018` | `require('crypto')` → `import crypto from 'crypto'` |
| 4 | BUG-004 | P1 | `src/lib/utils/commission.ts`, `src/lib/utils/attribution.ts` | `124a018` | `as any` → proper union types and typed Prisma where clauses |

---

## Commit Details

### `124a018` — fix(P0): Admin layout conditional hook + lint cleanup
**Files changed:** 4
- `src/app/admin/layout.tsx`: Moved `useEffect` before conditional `return` (hooks order fix)
- `src/lib/auth.ts`: `require('crypto')` → top-level `import crypto from 'crypto'`
- `src/lib/utils/commission.ts`: 3× `as any` → `as 'AFFILIATE' | 'AGENT' | 'LEADER'`
- `src/lib/utils/attribution.ts`: `const where: any` → typed `{ expiresAt, userId?, sessionId? }`

### `41e98fd` — fix(P0): FlashSale infinite loop — new Date() in default prop
**Files changed:** 1
- `src/components/FlashSale.tsx`: Added `useMemo` to stabilize `endTime` reference, preventing re-creation on each render
