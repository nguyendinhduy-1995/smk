export interface AnalyticsData {
    summary: {
        totalRevenue: number; prevTotalRevenue: number; revenueGrowth: number;
        totalOrders: number; prevTotalOrders: number; ordersGrowth: number;
        totalDiscount: number; avgOrderValue: number; prevAOV: number; aovGrowth: number;
        totalCustomers: number; newCustomers: number; repeatCustomers: number; repeatRate: string;
        cancelledOrders: number; returnedOrders: number; cancelRate: number; returnRate: number;
    };
    revenueChart: { date: string; revenue: number; orders: number; discount: number; cancelled: number }[];
    paymentBreakdown: Record<string, { count: number; total: number }>;
    paymentStatusBreakdown: Record<string, number>;
    orderStatusDistribution: { status: string; count: number; total: number }[];
    partnerRanking: { code: string; name: string; level: string; revenue: number; orders: number }[];
    productPerformance: { name: string; brand: string; slug: string; category: string; sold: number; revenue: number; orders: number }[];
    conversionFunnel: { stage: string; count: number }[];
    categoryBreakdown: { category: string; productCount: number; sold: number; revenue: number }[];
    inventory: {
        totalVariants: number; lowStockCount: number; outOfStockCount: number;
        lowStockItems: { name: string; sku: string; stock: number; reserved: number }[];
    };
    reviews: { total: number; avgRating: number; distribution: { rating: number; count: number }[] };
    timeAnalysis: {
        hourlyRevenue: number[]; hourlyOrders: number[];
        weekdayRevenue: number[]; weekdayOrders: number[];
        weekdayNames: string[];
    };
    shippingStats: { carrier: string; count: number }[];
    geoDistribution: { province: string; count: number }[];
    period: number;
}

export function formatVND(n: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export function formatCompact(n: number) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
}

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    CREATED: { label: 'Mới tạo', color: '#94a3b8' },
    CONFIRMED: { label: 'Xác nhận', color: '#60a5fa' },
    PAID: { label: 'Đã TT', color: '#34d399' },
    SHIPPING: { label: 'Đang giao', color: '#fbbf24' },
    DELIVERED: { label: 'Đã giao', color: '#22c55e' },
    FAILED_DELIVERY: { label: 'Giao thất bại', color: '#f87171' },
    RETURNED: { label: 'Hoàn trả', color: '#fb923c' },
    CANCELLED: { label: 'Đã huỷ', color: '#ef4444' },
};

export const PAYMENT_LABELS: Record<string, string> = {
    COD: '💵 COD', BANK_TRANSFER: '🏦 Chuyển khoản', MOMO: '📱 MoMo',
    VNPAY: '💳 VNPay', ZALOPAY: '📲 ZaloPay',
};

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    'kinh-mat': { label: 'Kính mắt', icon: '' },
    'kinh-ram': { label: 'Kính râm', icon: '🕶️' },
    'gong-kinh': { label: 'Gọng kính', icon: '🔲' },
    'trong-kinh': { label: 'Tròng kính', icon: '🔵' },
    'kinh-ap-trong': { label: 'Kính áp tròng', icon: '' },
    'kinh-bao-ho': { label: 'Kính bảo hộ', icon: '🥽' },
    'kinh-thoi-trang': { label: 'Kính thời trang', icon: '' },
    'phu-kien': { label: 'Phụ kiện', icon: '🧴' },
};

export const LEVEL_ICONS: Record<string, string> = { AFFILIATE: '⭐', AGENT: '🏆', LEADER: '👑' };

export type TabKey = 'overview' | 'revenue' | 'products' | 'customers' | 'operations' | 'behavior' | 'traffic';
