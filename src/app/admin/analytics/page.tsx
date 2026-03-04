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
    };

    const quickSelect = (d: number) => {
        setPeriod(d);
        setDateFrom('');
        setDateTo('');
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch(`/api/admin/analytics?period=${period}`).then(r => r.json()).catch(() => null),
            fetch('/api/analytics/track').then(r => r.json()).catch(() => null),
        ]).then(([adminData, trackData]) => {
            if (adminData) setData(adminData);
            if (trackData) setVisitorData(trackData);
            setLastUpdated(new Date());
        }).finally(() => setLoading(false));
    }, [period]);

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
                            {[7, 30, 60, 90, 180, 365].map(d => (
                                <button key={d} className={`analytics-period-btn ${period === d && !dateFrom ? 'analytics-period-btn--active' : ''}`}
                                    onClick={() => quickSelect(d)}>
                                    {d <= 90 ? `${d}N` : d === 180 ? '6T' : '1N'}
                                </button>
                            ))}
                        </div>
                        <div className="analytics-date-range">
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="analytics-date-input" />
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>→</span>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="analytics-date-input" />
                            <button className="analytics-period-btn analytics-period-btn--apply"
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
                <span>Kỳ báo cáo: <strong>{data.period} ngày</strong></span>
                <span>Dữ liệu được tải từ hệ thống quản trị Siêu Thị Mắt Kính</span>
            </div>
        </div>
    );
}
