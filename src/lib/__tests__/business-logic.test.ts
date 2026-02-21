import { describe, it, expect } from 'vitest';
import {
    calcCommission, COMMISSION_RATES, canReleaseCommission,
    calcRiskScore, shouldHoldCommission,
    resolvePartnerFromRef,
    canDecrementStock, decrementStock, restoreStock,
    hasPermission, getAccessibleRoutes,
} from '@/lib/business-logic';

/* ═══════════════════ COMMISSION ═══════════════════ */
describe('Commission Logic', () => {
    it('calculates 5% for AFFILIATE', () => {
        expect(calcCommission(1000000, 'AFFILIATE')).toBe(50000);
    });

    it('calculates 8% for AGENT', () => {
        expect(calcCommission(1000000, 'AGENT')).toBe(80000);
    });

    it('calculates 12% for LEADER', () => {
        expect(calcCommission(1000000, 'LEADER')).toBe(120000);
    });

    it('defaults to AFFILIATE rate for unknown level', () => {
        expect(calcCommission(1000000, 'UNKNOWN')).toBe(50000);
    });

    it('rounds to integer', () => {
        expect(calcCommission(999999, 'AFFILIATE')).toBe(50000); // 49999.95 → 50000
    });

    it('has correct rate definitions', () => {
        expect(COMMISSION_RATES.AFFILIATE).toBe(5);
        expect(COMMISSION_RATES.AGENT).toBe(8);
        expect(COMMISSION_RATES.LEADER).toBe(12);
    });

    it('canReleaseCommission only when PENDING and hold expired', () => {
        const past = new Date(Date.now() - 86400000);
        const future = new Date(Date.now() + 86400000);

        expect(canReleaseCommission('PENDING', past)).toBe(true);
        expect(canReleaseCommission('PENDING', future)).toBe(false);
        expect(canReleaseCommission('AVAILABLE', past)).toBe(false);
        expect(canReleaseCommission('PAID', past)).toBe(false);
    });
});

/* ═══════════════════ FRAUD / RISK ═══════════════════ */
describe('Fraud Risk Score', () => {
    it('scores 0 for clean partner', () => {
        expect(calcRiskScore({ returnRate: 3, cancelRate: 2, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0 })).toBe(0);
    });

    it('scores high for abusive partner', () => {
        const score = calcRiskScore({ returnRate: 80, cancelRate: 45, sameDevice: 12, sameAddress: 8, selfPurchase: 10, ipOverlap: 12 });
        expect(score).toBe(100); // capped at 100
    });

    it('adds 30 for returnRate > 25%', () => {
        expect(calcRiskScore({ returnRate: 30, cancelRate: 0, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0 })).toBe(30);
    });

    it('adds 15 for returnRate 16-25%', () => {
        expect(calcRiskScore({ returnRate: 20, cancelRate: 0, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0 })).toBe(15);
    });

    it('adds 20 for cancelRate > 20%', () => {
        expect(calcRiskScore({ returnRate: 0, cancelRate: 25, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0 })).toBe(20);
    });

    it('adds 10 for cancelRate 11-20%', () => {
        expect(calcRiskScore({ returnRate: 0, cancelRate: 15, sameDevice: 0, sameAddress: 0, selfPurchase: 0, ipOverlap: 0 })).toBe(10);
    });

    it('self-purchase is most penalized (+10 each)', () => {
        expect(calcRiskScore({ returnRate: 0, cancelRate: 0, sameDevice: 0, sameAddress: 0, selfPurchase: 5, ipOverlap: 0 })).toBe(50);
    });

    it('shouldHoldCommission when score > 40', () => {
        expect(shouldHoldCommission(41)).toBe(true);
        expect(shouldHoldCommission(40)).toBe(false);
        expect(shouldHoldCommission(0)).toBe(false);
    });
});

/* ═══════════════════ ATTRIBUTION ═══════════════════ */
describe('Attribution Logic', () => {
    it('coupon partner takes priority over ref', () => {
        expect(resolvePartnerFromRef('REF_001', 'COUPON_PARTNER')).toBe('COUPON_PARTNER');
    });

    it('uses ref when no coupon partner', () => {
        expect(resolvePartnerFromRef('REF_001', null)).toBe('REF_001');
    });

    it('returns null when neither', () => {
        expect(resolvePartnerFromRef(null, null)).toBeNull();
    });

    it('uses coupon even when ref is null', () => {
        expect(resolvePartnerFromRef(null, 'COUPON_PARTNER')).toBe('COUPON_PARTNER');
    });
});

/* ═══════════════════ INVENTORY ═══════════════════ */
describe('Inventory Logic', () => {
    it('allows decrement when stock is sufficient', () => {
        expect(canDecrementStock(10, 5)).toBe(true);
        expect(canDecrementStock(1, 1)).toBe(true);
    });

    it('rejects decrement when insufficient', () => {
        expect(canDecrementStock(0, 1)).toBe(false);
        expect(canDecrementStock(5, 6)).toBe(false);
    });

    it('rejects zero or negative qty', () => {
        expect(canDecrementStock(10, 0)).toBe(false);
        expect(canDecrementStock(10, -1)).toBe(false);
    });

    it('decrements correctly', () => {
        expect(decrementStock(10, 3)).toBe(7);
        expect(decrementStock(1, 1)).toBe(0);
    });

    it('throws on insufficient stock', () => {
        expect(() => decrementStock(5, 10)).toThrow('Insufficient stock');
    });

    it('prevents negative stock (key P0)', () => {
        expect(() => decrementStock(0, 1)).toThrow();
        expect(decrementStock(5, 5)).toBe(0);
        expect(canDecrementStock(0, 1)).toBe(false);
    });

    it('restores stock on cancel/return', () => {
        expect(restoreStock(5, 3)).toBe(8);
    });

    it('rejects non-positive restore qty', () => {
        expect(() => restoreStock(5, 0)).toThrow();
        expect(() => restoreStock(5, -1)).toThrow();
    });
});

/* ═══════════════════ RBAC ═══════════════════ */
describe('RBAC', () => {
    it('ADMIN has access to everything', () => {
        expect(hasPermission('ADMIN', 'products')).toBe(true);
        expect(hasPermission('ADMIN', 'fraud')).toBe(true);
        expect(hasPermission('ADMIN', 'anything')).toBe(true);
    });

    it('STORE_MANAGER can access allowed routes', () => {
        expect(hasPermission('STORE_MANAGER', 'products')).toBe(true);
        expect(hasPermission('STORE_MANAGER', 'orders')).toBe(true);
        expect(hasPermission('STORE_MANAGER', 'warehouse')).toBe(true);
    });

    it('STORE_MANAGER cannot access admin-only routes', () => {
        expect(hasPermission('STORE_MANAGER', 'fraud')).toBe(false);
        expect(hasPermission('STORE_MANAGER', 'commission-tiers')).toBe(false);
        expect(hasPermission('STORE_MANAGER', 'users')).toBe(false);
    });

    it('STAFF has minimal access', () => {
        expect(hasPermission('STAFF', 'orders')).toBe(true);
        expect(hasPermission('STAFF', 'customers')).toBe(true);
        expect(hasPermission('STAFF', 'support')).toBe(true);
    });

    it('STAFF blocked from products/fraud/users', () => {
        expect(hasPermission('STAFF', 'products')).toBe(false);
        expect(hasPermission('STAFF', 'fraud')).toBe(false);
        expect(hasPermission('STAFF', 'users')).toBe(false);
    });

    it('custom permissions override role defaults', () => {
        expect(hasPermission('STAFF', 'products', ['products'])).toBe(true);
    });

    it('unknown role has no access', () => {
        expect(hasPermission('UNKNOWN', 'products')).toBe(false);
    });

    it('getAccessibleRoutes returns correct routes per role', () => {
        expect(getAccessibleRoutes('ADMIN')).toEqual(['*']);
        expect(getAccessibleRoutes('STAFF')).toEqual(['orders', 'customers', 'support']);
    });
});
