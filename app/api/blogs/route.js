import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function generateExcerpt(html) {
  const plain = html.replace(/<[^>]+>/g, '').trim();
  return plain.length > 197 ? plain.substring(0, 197) + '...' : plain;
}

// Always enforce excerpt length limit regardless of source
function safeExcerpt(text) {
  if (!text) return text;
  const t = text.trim();
  return t.length > 197 ? t.substring(0, 197) + '...' : t;
}

// ─── GET /api/blogs ────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status   = searchParams.get('status');
    const category = searchParams.get('category');
    const search   = searchParams.get('search');
    const page     = parseInt(searchParams.get('page')  || '1', 10);
    const limit    = parseInt(searchParams.get('limit') || '9', 10);

    const filter = {};
    if (status) filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('-content -viewedIPs')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return NextResponse.json({
      blogs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/blogs]', error);
    return NextResponse.json({ error: 'Failed to fetch blogs', name: error?.name, reason: error?.message }, { status: 500 });
  }
}

// ─── POST /api/blogs ───────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Auto-generate slug if missing
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
    }

    // Auto-generate excerpt from content if not provided, always enforce length
    if (!body.excerpt && body.content) {
      body.excerpt = generateExcerpt(body.content);
    } else if (body.excerpt) {
      body.excerpt = safeExcerpt(body.excerpt);
    }

    const blog = await Blog.create(body);
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/blogs]', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A blog with this slug already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message || 'Failed to create blog' }, { status: 500 });
  }
}