"use client";

import { useState, useEffect, useCallback } from "react";

interface StockItem {
    id: string;
    sku: string;
    name: string;
    brand: string | null;
    frameColor: string;
    slug: string;
    productStatus: string;
    stockQty: number;
    reserved: number;
    available: number;
    price: number;
}

interface Stats {
    totalItems: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
}

function formatVND(n: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export default function AdminWarehousePage() {
    const [items, setItems] = useState<StockItem[]>([]);
    const [stats, setStats] = useState<Stats>({ totalItems: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "low" | "out">("all");
    const [toast, setToast] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editQty, setEditQty] = useState(0);
    const [saving, setSaving] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const fetchStock = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            const res = await fetch(`/api/admin/warehouse?${params}`);
            if (res.ok) {
                const data = await res.json();
                setItems(data.items || []);
                setStats(data.stats || { totalItems: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0 });
            }
        } catch { /* silent */ }
        setLoading(false);
    }, [search]);

    useEffect(() => { fetchStock(); }, [fetchStock]);

    const updateStock = async (variantId: string, newStockQty: number) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/warehouse", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variantId, stockQty: newStockQty }),
            });
            if (res.ok) {
                showToast("Đã cập nhật tồn kho");
                await fetchStock();
                setEditingId(null);
            } else {
                showToast("Lỗi cập nhật");
            }
        } catch {
            showToast("Lỗi kết nối");
        }
        setSaving(false);
    };

    const filtered = items.filter((item) => {
        if (filter === "low") return item.available > 0 && item.available <= 5;
        if (filter === "out") return item.available <= 0;
        return true;
    });

    return (
        <div className="animate-in">
            {toast && <div style={{ position: "fixed", top: 20, right: 20, zIndex: 999, padding: "12px 20px", background: "rgba(34,197,94,0.9)", color: "#fff", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 600 }}>{toast}</div>}

            <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: 700, marginBottom: "var(--space-4)" }}>Kho hàng</h1>

            {/* Stats */}
            <div className="zen-stat-grid" style={{ marginBottom: "var(--space-5)" }}>
                {[
                    { label: "Tổng SKU", value: String(stats.totalItems), icon: "", color: "var(--text-primary)" },
                    { label: "Tổng tồn kho", value: String(stats.totalStock), icon: "", color: "var(--gold-400)" },
                    { label: "Sắp hết hàng", value: String(stats.lowStockCount), icon: "", color: "#f59e0b" },
                    { label: "Hết hàng", value: String(stats.outOfStockCount), icon: "", color: "#ef4444" },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: "var(--space-4)", textAlign: "center" }}>
                        <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: "var(--text-xl)", fontWeight: 800, color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: "flex", gap: "var(--space-3)", marginBottom: "var(--space-4)", flexWrap: "wrap", alignItems: "center" }}>
                <input
                    className="input"
                    placeholder="Tìm SKU, tên sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: "1 1 200px", minWidth: 0, maxWidth: 360, fontSize: "var(--text-sm)" }}
                />
                <div style={{ display: "flex", gap: "var(--space-1)" }}>
                    {(["all", "low", "out"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className="btn"
                            style={{
                                fontSize: "var(--text-xs)", padding: "6px 12px",
                                background: filter === f ? "var(--gold-500)" : "var(--bg-tertiary)",
                                color: filter === f ? "#0a0a0f" : "var(--text-secondary)",
                                fontWeight: filter === f ? 700 : 500,
                            }}
                        >
                            {f === "all" ? "Tất cả" : f === "low" ? "Sắp hết" : "Hết hàng"}
                        </button>
                    ))}
                </div>
                <button onClick={fetchStock} className="btn" style={{ fontSize: "var(--text-xs)", padding: "6px 12px" }}>Làm mới</button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "var(--space-8)", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                    <p>Đang tải dữ liệu kho...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
                    <div style={{ fontSize: 48, marginBottom: 8 }}></div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Không có sản phẩm</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
                        {search ? "Không tìm thấy sản phẩm phù hợp" : "Kho hàng trống. Thêm sản phẩm để bắt đầu."}
                    </p>
                </div>
            ) : (
                <div className="card" style={{ overflow: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Sản phẩm</th>
                                <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>SKU</th>
                                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Tồn kho</th>
                                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Đặt trước</th>
                                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Có sẵn</th>
                                <th style={{ textAlign: "right", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Giá</th>
                                <th style={{ textAlign: "center", padding: "12px 16px", fontWeight: 700, fontSize: "var(--text-xs)", color: "var(--text-muted)", textTransform: "uppercase" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border-primary)" }}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                                            {item.frameColor} {item.brand ? `· ${item.brand}` : ""}
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <code style={{ fontSize: "var(--text-xs)", background: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: 4 }}>{item.sku}</code>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        {editingId === item.id ? (
                                            <input
                                                type="number"
                                                value={editQty}
                                                onChange={(e) => setEditQty(Number(e.target.value))}
                                                style={{ width: 70, textAlign: "center", padding: "4px 8px", borderRadius: 6, border: "1px solid var(--gold-400)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "var(--text-sm)" }}
                                                min={0}
                                                autoFocus
                                            />
                                        ) : (
                                            <span style={{ fontWeight: 700 }}>{item.stockQty}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-muted)" }}>{item.reserved}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: item.available <= 0 ? "#ef4444" : item.available <= 5 ? "#f59e0b" : "#22c55e",
                                        }}>
                                            {item.available}
                                        </span>
                                    </td>
                                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "var(--gold-400)" }}>{formatVND(item.price)}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                        {editingId === item.id ? (
                                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                                <button
                                                    onClick={() => updateStock(item.id, editQty)}
                                                    disabled={saving}
                                                    className="btn"
                                                    style={{ fontSize: "var(--text-xs)", padding: "4px 10px", background: "#22c55e", color: "#fff", fontWeight: 700 }}
                                                >
                                                    {saving ? "⏳" : ""}
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="btn"
                                                    style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingId(item.id); setEditQty(item.stockQty); }}
                                                className="btn"
                                                style={{ fontSize: "var(--text-xs)", padding: "4px 10px" }}
                                            >
                                                Sửa
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Summary */}
            {!loading && filtered.length > 0 && (
                <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
                    Hiển thị {filtered.length} / {items.length} sản phẩm · Tổng tồn kho: {stats.totalStock}
                </p>
            )}
        </div>
    );
}
