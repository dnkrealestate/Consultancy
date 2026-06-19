import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User'; // ensure registered for populate
import LeadHistory from '@/models/LeadHistory';
import { getAuthUser } from '@/lib/auth';
import { canAccessModule } from '@/lib/permissions';

// GET /api/leads/:id/history  → full pipeline log for one lead.
// Agents may only read history for leads assigned to them.
export async function GET(req, { params }) {
  await dbConnect();

  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canAccessModule(me, 'leads')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const lead = await Lead.findById(id).select('assignedTo');
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    if (me.role === 'agent' && String(lead.assignedTo) !== String(me._id)) {
      return NextResponse.json({ error: 'This lead is not assigned to you' }, { status: 403 });
    }

    const history = await LeadHistory.find({ lead: id })
      .populate('actor', 'name role')
      .sort({ createdAt: -1 });

    return NextResponse.json(history);
  } catch (error) {
    console.error('GET /api/leads/[id]/history error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}