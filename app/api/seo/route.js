import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SeoMeta from '@/models/SeoMeta';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';

function canManage(me) {
  return me && (me.role === 'admin' || canAccessModule(me, 'seo'));
}

// GET /api/seo  → list all SEO records (admin or seo-module users).
export async function GET(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManage(me)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const records = await SeoMeta.find({}).sort({ path: 1 });
  return NextResponse.json(records);
}

// POST /api/seo  → create or update the SEO record for a path (upsert).
export async function POST(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManage(me)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const b = await req.json();
    if (!b.path || !b.path.startsWith('/')) {
      return NextResponse.json({ error: 'A valid path (starting with /) is required' }, { status: 400 });
    }

    // Validate optional JSON-LD so we never store broken markup.
    if (b.jsonLd && b.jsonLd.trim()) {
      try { JSON.parse(b.jsonLd); }
      catch { return NextResponse.json({ error: 'Structured data is not valid JSON' }, { status: 400 }); }
    }

    const keywords = Array.isArray(b.keywords)
      ? b.keywords
      : typeof b.keywords === 'string'
      ? b.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    const update = {
      title: b.title || '',
      description: b.description || '',
      keywords,
      ogTitle: b.ogTitle || '',
      ogDescription: b.ogDescription || '',
      ogImage: b.ogImage || '',
      canonical: b.canonical || '',
      noindex: !!b.noindex,
      jsonLd: b.jsonLd || '',
      updatedBy: me._id,
    };

    const record = await SeoMeta.findOneAndUpdate(
      { path: b.path.trim() },
      { $set: update, $setOnInsert: { path: b.path.trim() } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(record);
  } catch (error) {
    console.error('POST /api/seo error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
