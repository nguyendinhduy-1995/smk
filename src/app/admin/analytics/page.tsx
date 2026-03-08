'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, TabKey } from './types';
import OverviewTab from './OverviewTab';
import RevenueTab from './RevenueTab';
import ProductsTab from './ProductsTab';
import CustomersTab from './CustomersTab';
import OperationsTab from './OperationsTab';
import BehaviorTab from './BehaviorTab';
import TrafficTab from './TrafficTab';

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Tổng quan', icon: '' },
    { key: 'behavior', label: 'Hành vi', icon: '' },
    { key: 'traffic', label: 'Nguồn & Thiết bị', icon: '' },
    { key: 'revenue', label: 'Doanh thu', icon: '' },
    { key: 'products', label: 'Sản phẩm', icon: '' },
    { key: 'customers', label: 'Khách hàng', icon: '' },
    { key: 'operations', label: 'Vận hành', icon: '' },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [visitorData, setVisitorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const [offset, setOffset] = useState(0); // 0 = up to today, 1 = yesterday only
    const [activePreset, setActivePreset] = useState<string>('30d');
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const applyCustomRange = () => {
        if (!dateFrom || !dateTo) return;
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const diff = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000));
        setPeriod(diff);
        setOffset(0);
        setActivePreset('custom');
    };

    const presets = [
        { key: 'today', label: 'Hôm nay', days: 1, off: 0 },
        { key: 'yesterday', label: 'Hôm qua', days: 1, off: 1 },
        { key: '7d', label: '7 ngày', days: 7, off: 0 },
        { key: '30d', label: '30 ngày', days: 30, off: 0 },
    ];

    const selectPreset = (p: typeof presets[0]) => {
        setPeriod(p.days);
        setOffset(p.off);
        setActivePreset(p.key);
        setDateFrom('');
        setDateTo('');
    };

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams({ period: String(period) });
        if (offset > 0) params.set('offset', String(offset));
        Promise.all([
            fetch(`/api/admin/analytics?${params}`).then(r => r.json()).catch(() => null),
            fetch('/api/analytics/track').then(r => r.json()).catch(() => null),
        ]).then(([adminData, trackData]) => {
            if (adminData) setData(adminData);
            if (trackData) setVisitorData(trackData);
            setLastUpdated(new Date());
        }).finally(() => setLoading(false));
    }, [period, offset]);

    if (loading) return (
        <div className="analytics-loading">
            <div className="analytics-loading__spinner" />
            <p>Đang tải phân tích dữ liệu...</p>
        </div>
    );
    if (!data) return (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}></div>
            <p>Không tải được dữ liệu phân tích</p>
        </div>
    );

    const presetLabel = presets.find(p => p.key === activePreset)?.label || `${period} ngày`;

    return (
        <div className="analytics-page animate-in">
            {/* Header */}
            <div className="analytics-page__header">
                <div className="analytics-page__title-row">
                    <div>
                        <h1 className="analytics-page__title">Phân tích chi tiết</h1>
                        {lastUpdated && (
                            <span className="analytics-page__updated">
                                Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                            </span>
                        )}
                    </div>
                    <div className="analytics-page__controls">
                        <div className="analytics-period-btns">
                            {presets.map(p => (
                                <button key={p.key} className={`analytics-period-btn ${activePreset === p.key ? 'analytics-period-btn--active' : ''}`}
                                    onClick={() => selectPreset(p)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="analytics-date-range">
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="analytics-date-input" />
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="analytics-date-input" />
                            <button className={`analytics-period-btn ${activePreset === 'custom' ? 'analytics-period-btn--active' : 'analytics-period-btn--apply'}`}
                                onClick={applyCustomRange} disabled={!dateFrom || !dateTo}>
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="analytics-tabs">
                {TABS.map(t => (
                    <button key={t.key}
                        className={`analytics-tab ${activeTab === t.key ? 'analytics-tab--active' : ''}`}
                        onClick={() => setActiveTab(t.key)}>
                        <span className="analytics-tab__icon">{t.icon}</span>
                        <span className="analytics-tab__label">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="analytics-tab-content">
                {activeTab === 'overview' && <OverviewTab data={data} />}
                {activeTab === 'revenue' && <RevenueTab data={data} />}
                {activeTab === 'products' && <ProductsTab data={data} />}
                {activeTab === 'customers' && <CustomersTab data={data} />}
                {activeTab === 'operations' && <OperationsTab data={data} />}
                {activeTab === 'behavior' && visitorData && <BehaviorTab data={visitorData} />}
                {activeTab === 'traffic' && visitorData && <TrafficTab data={visitorData} />}
                {(activeTab === 'behavior' || activeTab === 'traffic') && !visitorData && (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}></div>
                        <p>Chưa có dữ liệu hành vi. Dữ liệu sẽ tích lũy khi có người truy cập website.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="analytics-footer">
                <span>Kỳ báo cáo: <strong>{presetLabel}</strong></span>
                <span>Dữ liệu được tải từ hệ thống quản trị Siêu Thị Mắt Kính</span>
            </div>
        </div>
    );
}
