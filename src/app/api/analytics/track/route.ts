import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.analytics');
const VISITS_FILE = join(DATA_DIR, 'visits.json');
const BEHAVIOR_FILE = join(DATA_DIR, 'behavior.json');

interface VisitData {
    date: string;
    views: number;
    uniqueSessions: string[];
    topPages: Record<string, number>;
    topActions: Record<string, number>;
    hourlyViews: number[];
}

interface SessionData {
    lastSeen: number;
    pageCount: number;
    productViewCount: number;
    actionCount: number;
    visitCount: number;
    lastPath: string;
    entryPage: string;
    exitPage?: string;
    categories: string[];
    priceRange: { min: number; max: number; avg: number } | null;
    lastProducts: string[];
    // Enhanced fields
    device: {
        deviceType: string;
        os: string;
        browser: string;
        screenWidth: number;
        screenHeight: number;
        language: string;
        timezone: string;
        touchScreen: boolean;
        connectionType?: string;
    } | null;
    referrer: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    avgTimeOnPage: number; // ms
    totalSessionTime: number; // ms
    avgScrollDepth: number; // 0-100
    isBounce: boolean;
    pageFlow: string[];
    pageCounts?: Record<string, number>;
}

interface BehaviorSummary {
    sessions: Record<string, SessionData>;
}

async function ensureDir() {
    try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
    try { return JSON.parse(await readFile(path, 'utf-8')); } catch { return fallback; }
}

// POST — receive tracking data
export async function POST(req: NextRequest) {
    try {
        let body;
        const ct = req.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            body = await req.json();
        } else {
            // sendBeacon sends as text/plain
            const text = await req.text();
            body = JSON.parse(text);
        }

        const {
            sessionId, pageCount, productViewCount, actionCount, visitCount,
            currentPath, entryPage, exitPage, lastProducts, categories, priceRange, actions,
            device, referrer, utmSource, utmMedium, utmCampaign,
            avgTimeOnPage, totalSessionTime, avgScrollDepth, isBounce,
            pageFlow, pageCounts,
        } = body;

        await ensureDir();

        const today = new Date().toISOString().slice(0, 10);
        const hour = new Date().getHours();

        // Update visits
        const visits = await readJson<Record<string, VisitData>>(VISITS_FILE, {});
        if (!visits[today]) {
            visits[today] = { date: today, views: 0, uniqueSessions: [], topPages: {}, topActions: {}, hourlyViews: new Array(24).fill(0) };
        }
        const dayData = visits[today];
        dayData.views++;
        dayData.hourlyViews[hour] = (dayData.hourlyViews[hour] || 0) + 1;
        if (sessionId && !dayData.uniqueSessions.includes(sessionId)) {
            dayData.uniqueSessions.push(sessionId);
        }
        if (currentPath) {
            dayData.topPages[currentPath] = (dayData.topPages[currentPath] || 0) + 1;
        }
        if (actions && Array.isArray(actions)) {
            for (const a of actions) {
                const key = `${a.type}:${a.target}`;
                dayData.topActions[key] = (dayData.topActions[key] || 0) + 1;
            }
        }

        // Keep only last 30 days
        const dates = Object.keys(visits).sort();
        if (dates.length > 30) {
            for (const d of dates.slice(0, dates.length - 30)) delete visits[d];
        }
        await writeFile(VISITS_FILE, JSON.stringify(visits, null, 2));

        // Update behavior
        const behavior = await readJson<BehaviorSummary>(BEHAVIOR_FILE, { sessions: {} });
        behavior.sessions[sessionId] = {
            lastSeen: Date.now(),
            pageCount: pageCount || 0,
            productViewCount: productViewCount || 0,
            actionCount: actionCount || 0,
            visitCount: visitCount || 0,
            lastPath: currentPath || '/',
            entryPage: entryPage || '/',
            exitPage: exitPage || undefined,
            categories: categories || [],
            priceRange: priceRange || null,
            lastProducts: lastProducts || [],
            device: device || null,
            referrer: referrer || '',
            utmSource: utmSource || undefined,
            utmMedium: utmMedium || undefined,
            utmCampaign: utmCampaign || undefined,
            avgTimeOnPage: avgTimeOnPage || 0,
            totalSessionTime: totalSessionTime || 0,
            avgScrollDepth: avgScrollDepth || 0,
            isBounce: isBounce || false,
            pageFlow: pageFlow || [],
            pageCounts: pageCounts || undefined,
        };

        // Clean old sessions (>7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        for (const [sid, session] of Object.entries(behavior.sessions)) {
            if (session.lastSeen < weekAgo) delete behavior.sessions[sid];
        }
        await writeFile(BEHAVIOR_FILE, JSON.stringify(behavior, null, 2));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Analytics track error:', err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}

// GET — retrieve comprehensive analytics summary for admin dashboard
export async function GET() {
    try {
        await ensureDir();
        const visits = await readJson<Record<string, VisitData>>(VISITS_FILE, {});
        const behavior = await readJson<BehaviorSummary>(BEHAVIOR_FILE, { sessions: {} });

        const today = new Date().toISOString().slice(0, 10);
        const todayData = visits[today] || { views: 0, uniqueSessions: [], topPages: {}, topActions: {}, hourlyViews: new Array(24).fill(0) };

        // Last 30 days
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
            last30Days.push({
                date: key, day: dayNames[d.getDay()],
                views: visits[key]?.views || 0,
                unique: visits[key]?.uniqueSessions?.length || 0,
            });
        }

        const sessions = Object.values(behavior.sessions);
        const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
        const activeSessions = sessions.filter(s => s.lastSeen > thirtyMinAgo).length;

        // Top pages today
        const topPages = Object.entries(todayData.topPages)
            .sort(([, a], [, b]) => b - a).slice(0, 15)
            .map(([path, views]) => ({ path, views }));

        // All-time top pages (from all visits)
        const allTimePages: Record<string, number> = {};
        for (const day of Object.values(visits)) {
            for (const [path, count] of Object.entries(day.topPages)) {
                allTimePages[path] = (allTimePages[path] || 0) + count;
            }
        }
        const topPagesAllTime = Object.entries(allTimePages)
            .sort(([, a], [, b]) => b - a).slice(0, 20)
            .map(([path, views]) => ({ path, views }));

        // Top actions
        const topActions = Object.entries(todayData.topActions)
            .sort(([, a], [, b]) => b - a).slice(0, 15)
            .map(([action, count]) => ({ action, count }));

        // Category interest
        const categoryInterest: Record<string, number> = {};
        for (const session of sessions) {
            for (const cat of session.categories) {
                categoryInterest[cat] = (categoryInterest[cat] || 0) + 1;
            }
        }

        // Price range analysis
        const priceRanges = sessions.filter(s => s.priceRange).map(s => s.priceRange!);
        const avgPrice = priceRanges.length > 0
            ? Math.round(priceRanges.reduce((s, p) => s + p.avg, 0) / priceRanges.length) : 0;

        // ═══ Enhanced Analytics ═══

        // Device breakdown
        const deviceTypes: Record<string, number> = {};
        const browsers: Record<string, number> = {};
        const operatingSystems: Record<string, number> = {};
        const screenResolutions: Record<string, number> = {};
        const languages: Record<string, number> = {};
        const timezones: Record<string, number> = {};
        const connectionTypes: Record<string, number> = {};

        for (const s of sessions) {
            if (s.device) {
                deviceTypes[s.device.deviceType] = (deviceTypes[s.device.deviceType] || 0) + 1;
                browsers[s.device.browser] = (browsers[s.device.browser] || 0) + 1;
                operatingSystems[s.device.os] = (operatingSystems[s.device.os] || 0) + 1;
                const res = `${s.device.screenWidth}×${s.device.screenHeight}`;
                screenResolutions[res] = (screenResolutions[res] || 0) + 1;
                languages[s.device.language] = (languages[s.device.language] || 0) + 1;
                if (s.device.timezone) timezones[s.device.timezone] = (timezones[s.device.timezone] || 0) + 1;
                if (s.device.connectionType) connectionTypes[s.device.connectionType] = (connectionTypes[s.device.connectionType] || 0) + 1;
            }
        }

        // Referrer analysis
        const referrerSources: Record<string, number> = {};
        for (const s of sessions) {
            if (s.referrer) {
                try {
                    const host = new URL(s.referrer).hostname;
                    referrerSources[host] = (referrerSources[host] || 0) + 1;
                } catch {
                    referrerSources[s.referrer] = (referrerSources[s.referrer] || 0) + 1;
                }
            } else {
                referrerSources['Trực tiếp'] = (referrerSources['Trực tiếp'] || 0) + 1;
            }
        }

        // UTM tracking
        const utmSources: Record<string, number> = {};
        const utmMediums: Record<string, number> = {};
        const utmCampaigns: Record<string, number> = {};
        for (const s of sessions) {
            if (s.utmSource) utmSources[s.utmSource] = (utmSources[s.utmSource] || 0) + 1;
            if (s.utmMedium) utmMediums[s.utmMedium] = (utmMediums[s.utmMedium] || 0) + 1;
            if (s.utmCampaign) utmCampaigns[s.utmCampaign] = (utmCampaigns[s.utmCampaign] || 0) + 1;
        }

        // Time on page & session duration
        const sessionsWithTime = sessions.filter(s => s.avgTimeOnPage > 0);
        const avgTimeOnPage = sessionsWithTime.length > 0
            ? Math.round(sessionsWithTime.reduce((s, x) => s + x.avgTimeOnPage, 0) / sessionsWithTime.length) : 0;
        const avgSessionDuration = sessionsWithTime.length > 0
            ? Math.round(sessionsWithTime.reduce((s, x) => s + x.totalSessionTime, 0) / sessionsWithTime.length) : 0;

        // Scroll depth
        const sessionsWithScroll = sessions.filter(s => s.avgScrollDepth > 0);
        const avgScrollDepth = sessionsWithScroll.length > 0
            ? Math.round(sessionsWithScroll.reduce((s, x) => s + x.avgScrollDepth, 0) / sessionsWithScroll.length) : 0;

        // Bounce rate
        const bounceSessions = sessions.filter(s => s.isBounce).length;
        const bounceRate = sessions.length > 0 ? ((bounceSessions / sessions.length) * 100).toFixed(1) : '0';

        // Entry & Exit pages
        const entryPages: Record<string, number> = {};
        const exitPages: Record<string, number> = {};
        for (const s of sessions) {
            if (s.entryPage) entryPages[s.entryPage] = (entryPages[s.entryPage] || 0) + 1;
            if (s.exitPage) exitPages[s.exitPage] = (exitPages[s.exitPage] || 0) + 1;
        }

        // Page flow analysis (most common transitions)
        const pageTransitions: Record<string, number> = {};
        for (const s of sessions) {
            if (s.pageFlow && s.pageFlow.length > 1) {
                for (let i = 0; i < s.pageFlow.length - 1; i++) {
                    const key = `${s.pageFlow[i]} → ${s.pageFlow[i + 1]}`;
                    pageTransitions[key] = (pageTransitions[key] || 0) + 1;
                }
            }
        }

        // Pages per session
        const pagesPerSession = sessions.length > 0
            ? (sessions.reduce((s, x) => s + x.pageCount, 0) / sessions.length).toFixed(1) : '0';

        // AI Insights
        const insights: string[] = [];
        const totalViews = todayData.views;
        const uniqueVisitors = todayData.uniqueSessions.length;

        if (uniqueVisitors > 0) insights.push(`Trung bình ${pagesPerSession} trang/phiên truy cập`);
        if (avgTimeOnPage > 0) insights.push(`Thời gian xem trung bình: ${(avgTimeOnPage / 1000).toFixed(0)}s/trang`);
        if (avgScrollDepth > 0) insights.push(`Cuộn trang trung bình: ${avgScrollDepth}% — ${avgScrollDepth > 60 ? 'Người dùng đọc nội dung kỹ' : 'Cần cải thiện nội dung để giữ chân người dùng'}`);
        if (parseFloat(bounceRate) > 50) insights.push(`⚠️ Tỉ lệ thoát cao (${bounceRate}%) — Cần cải thiện trang đích`);
        else if (parseFloat(bounceRate) > 0) insights.push(`Tỉ lệ thoát: ${bounceRate}% — ${parseFloat(bounceRate) < 30 ? 'Rất tốt!' : 'Chấp nhận được'}`);

        const peakHour = todayData.hourlyViews.indexOf(Math.max(...todayData.hourlyViews));
        if (todayData.hourlyViews[peakHour] > 0) insights.push(`Giờ cao điểm: ${peakHour}:00-${peakHour + 1}:00 (${todayData.hourlyViews[peakHour]} lượt)`);
        if (avgPrice > 0) insights.push(`Ngân sách TB quan tâm: ${new Intl.NumberFormat('vi-VN').format(avgPrice)}₫`);

        const topCat = Object.entries(categoryInterest).sort(([, a], [, b]) => b - a)[0];
        if (topCat) insights.push(`Danh mục hot nhất: ${topCat[0]} (${topCat[1]} phiên)`);

        const mobileRate = sessions.length > 0 ? ((deviceTypes['mobile'] || 0) / sessions.length * 100).toFixed(0) : '0';
        if (parseInt(mobileRate) > 0) insights.push(`${mobileRate}% truy cập từ di động — ${parseInt(mobileRate) > 60 ? 'Ưu tiên tối ưu mobile!' : 'Cân bằng desktop/mobile tốt'}`);

        const productViewers = sessions.filter(s => s.productViewCount > 3).length;
        if (sessions.length > 0) {
            const engageRate = ((productViewers / sessions.length) * 100).toFixed(0);
            insights.push(`${engageRate}% khách xem >3 sản phẩm → Tương tác ${parseInt(engageRate) > 30 ? 'tốt' : 'cần cải thiện'}`);
        }

        return NextResponse.json({
            today: {
                views: totalViews, uniqueVisitors, activeSessions,
                topPages, topActions, hourlyViews: todayData.hourlyViews,
            },
            last30Days,
            behavior: {
                totalSessions: sessions.length,
                categoryInterest, avgPrice, pagesPerSession,
                avgTimeOnPage, avgSessionDuration, avgScrollDepth,
                bounceRate: parseFloat(bounceRate), bounceSessions,
            },
            devices: {
                types: deviceTypes, browsers, operatingSystems,
                screenResolutions, languages, connectionTypes,
            },
            traffic: {
                referrerSources,
                utmSources, utmMediums, utmCampaigns,
                entryPages: Object.entries(entryPages).sort(([, a], [, b]) => b - a).slice(0, 10).map(([path, count]) => ({ path, count })),
                exitPages: Object.entries(exitPages).sort(([, a], [, b]) => b - a).slice(0, 10).map(([path, count]) => ({ path, count })),
            },
            userFlow: {
                topTransitions: Object.entries(pageTransitions).sort(([, a], [, b]) => b - a).slice(0, 15).map(([flow, count]) => ({ flow, count })),
                topPagesAllTime,
            },
            aiInsights: insights,
        });
    } catch (err) {
        console.error('Analytics GET error:', err);
        return NextResponse.json({
            today: { views: 0, uniqueVisitors: 0, activeSessions: 0, topPages: [], topActions: [], hourlyViews: [] },
            last30Days: [], behavior: { totalSessions: 0, categoryInterest: {}, avgPrice: 0, pagesPerSession: '0', avgTimeOnPage: 0, avgSessionDuration: 0, avgScrollDepth: 0, bounceRate: 0, bounceSessions: 0 },
            devices: { types: {}, browsers: {}, operatingSystems: {}, screenResolutions: {}, languages: {}, connectionTypes: {} },
            traffic: { referrerSources: {}, utmSources: {}, utmMediums: {}, utmCampaigns: {}, entryPages: [], exitPages: [] },
            userFlow: { topTransitions: [], topPagesAllTime: [] },
            aiInsights: [],
        });
    }
}
