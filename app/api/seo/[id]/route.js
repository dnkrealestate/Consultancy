import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SeoMeta from '@/models/SeoMeta';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';

// DELETE /api/seo/:id  → remove a page's SEO record (reverts to defaults).
export async function DELETE(req, { params }) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!(me.role === 'admin' || canAccessModule(me, 'seo'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const removed = await SeoMeta.findByIdAndDelete(id);
    if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
