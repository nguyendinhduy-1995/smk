import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), '.data');
const CATEGORIES_FILE = join(DATA_DIR, 'categories.json');

export interface Category {
    id: string;
    value: string;
    label: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-1', value: 'kinh-mat', label: 'Kính mắt', icon: '👓', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-2', value: 'kinh-ram', label: 'Kính râm', icon: '🕶️', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-3', value: 'gong-kinh', label: 'Gọng kính', icon: '🔲', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-4', value: 'trong-kinh', label: 'Tròng kính', icon: '🔵', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-5', value: 'kinh-ap-trong', label: 'Kính áp tròng', icon: '👁️', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-6', value: 'kinh-bao-ho', label: 'Kính bảo hộ', icon: '🥽', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-7', value: 'kinh-thoi-trang', label: 'Kính thời trang', icon: '✨', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'cat-8', value: 'phu-kien', label: 'Phụ kiện kính', icon: '🧴', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

async function ensureDir() {
    try { await mkdir(DATA_DIR, { recursive: true }); } catch { /* exists */ }
}

async function readCategories(): Promise<Category[]> {
    try {
        const raw = await readFile(CATEGORIES_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        // First time — seed with defaults
        await ensureDir();
        await writeFile(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2));
        return DEFAULT_CATEGORIES;
    }
}

async function saveCategories(cats: Category[]) {
    await ensureDir();
    await writeFile(CATEGORIES_FILE, JSON.stringify(cats, null, 2));
}

function slugify(name: string) {
    return name.trim().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// GET — list all categories
export async function GET() {
    const cats = await readCategories();
    return NextResponse.json({ categories: cats });
}

// POST — create a new category
export async function POST(req: NextRequest) {
    const { label, icon } = await req.json();
    if (!label) return NextResponse.json({ error: 'Tên danh mục là bắt buộc' }, { status: 400 });

    const cats = await readCategories();
    const value = slugify(label);

    // Check duplicate
    if (cats.some(c => c.value === value)) {
        return NextResponse.json({ error: `Danh mục "${label}" đã tồn tại` }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newCat: Category = {
        id: `cat-${Date.now()}`,
        value,
        label: label.trim(),
        icon: icon || '📂',
        createdAt: now,
        updatedAt: now,
    };

    cats.push(newCat);
    await saveCategories(cats);
    return NextResponse.json({ category: newCat });
}

// PATCH — update a category
export async function PATCH(req: NextRequest) {
    const { id, label, icon } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID danh mục là bắt buộc' }, { status: 400 });

    const cats = await readCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });

    if (label) {
        cats[idx].label = label.trim();
        cats[idx].value = slugify(label);
    }
    if (icon) cats[idx].icon = icon;
    cats[idx].updatedAt = new Date().toISOString();

    await saveCategories(cats);
    return NextResponse.json({ category: cats[idx] });
}

// DELETE — remove a category
export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID danh mục là bắt buộc' }, { status: 400 });

    const cats = await readCategories();
    const filtered = cats.filter(c => c.id !== id);
    if (filtered.length === cats.length) {
        return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    await saveCategories(filtered);
    return NextResponse.json({ ok: true });
}
