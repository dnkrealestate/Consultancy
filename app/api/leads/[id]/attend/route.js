import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { getAuthUser } from '@/lib/auth';
import { logHistory } from '@/lib/history';


// POST /api/leads/:id/attend — mark lead as attended by the current agent
export async function POST(req, { params }) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only the assigned agent, admin, or back_office can mark as attended
    const isAssigned  = lead.assignedTo && String(lead.assignedTo) === String(me._id);
    const isPrivileged = me.role === 'admin' || me.role === 'back_office';
    if (!isAssigned && !isPrivileged) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (lead.attended) {
      // Already attended — just return the current state
      const populated = await Lead.findById(id).populate('assignedTo', 'name email role');
      return NextResponse.json(populated);
    }

    lead.attended   = true;
    lead.attendedAt = new Date();
    lead.attendedBy = me._id;
    await lead.save();

    await logHistory(lead._id, me, 'attended', {
      meta: { attendedBy: me.name },
    });

    const populated = await Lead.findById(id)
      .populate('assignedTo', 'name email role')
      .populate('attendedBy', 'name');
    return NextResponse.json(populated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
