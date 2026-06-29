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

function safeExcerpt(text) {
  if (!text) return text;
  const t = text.trim();
  return t.length > 197 ? t.substring(0, 197) + '...' : t;
}

// ─── GET /api/blogs/[id] ───────────────────────────────────────────────────────
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track') === 'true';

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    if (track) {
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

      const updated = await Blog.findOneAndUpdate(
        { ...query, viewedIPs: { $ne: ip } },
        { $inc: { views: 1 }, $push: { viewedIPs: ip } },
        { new: true }
      ).select('-viewedIPs');

      const result = updated || await Blog.findOne(query).select('-viewedIPs').lean();
      if (!result) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

      return NextResponse.json({ blog: result });
    }

    const blog = await Blog.findOne(query).select('-viewedIPs').lean();
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('[GET /api/blogs/[id]]', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// ─── PUT /api/blogs/[id] ───────────────────────────────────────────────────────
export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Strip protected fields
    delete body.views;
    delete body.viewedIPs;

    // Auto-generate slug if title provided but slug empty
    if (!body.slug && body.title) {
      body.slug = generateSlug(body.title);
    }

    // Auto-generate or trim excerpt
    if (!body.excerpt && body.content) {
      body.excerpt = generateExcerpt(body.content);
    } else if (body.excerpt) {
      body.excerpt = safeExcerpt(body.excerpt);
    }

    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const blog = await Blog.findOneAndUpdate(query, { $set: body }, {
      new: true,
      runValidators: true,
    }).select('-viewedIPs');

    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('[PUT /api/blogs/[id]]', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug already in use.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 500 });
  }
}

// ─── DELETE /api/blogs/[id] ────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const blog = await Blog.findOneAndDelete(query);
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    return NextResponse.json({ message: 'Blog deleted successfully', id: blog._id });
  } catch (error) {
    console.error('[DELETE /api/blogs/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}