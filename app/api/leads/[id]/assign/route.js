import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

// POST /api/leads/:id/assign  → manually (re)assign a lead (admin only).
// Body: { agentId: "<userId>" | null }   (null unassigns the lead)
export async function POST(req, { params }) {
  await dbConnect();

  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (me.role !== 'admin') {
    return NextResponse.json({ error: 'Only an admin can assign leads' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { agentId } = await req.json();

    const lead = await Lead.findById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Validate the target agent unless we're unassigning.
    let agent = null;
    if (agentId) {
      agent = await User.findById(agentId);
      if (!agent || agent.role !== 'agent') {
        return NextResponse.json({ error: 'Target user is not a valid agent' }, { status: 400 });
      }
    }

    const previous = lead.assignedTo ? String(lead.assignedTo) : null;
    const next = agent ? String(agent._id) : null;

    if (previous === next) {
      await lead.populate('assignedTo', 'name email role');
      return NextResponse.json(lead); // no-op
    }

    lead.assignedTo = next;
    if (next) {
      // Ownership trail (distinct from the pipeline history log).
      lead.assignmentHistory.push({
        agent: next,
        assignedBy: me._id,
        method: 'manual',
        assignedAt: new Date(),
      });
    }
    await lead.save();

    // 🔵 HISTORY HOOK — record this in YOUR pipeline-history log:
    //   if (!next)         → action 'unassigned'  (from: previous)
    //   else if (!previous)→ action 'assigned'    (to: next, method 'manual')
    //   else               → action 'transferred' (from: previous, to: next)
    // e.g. await logHistory(lead._id, me, action, { from, to, meta:{method:'manual'} });

    await lead.populate('assignedTo', 'name email role');
    return NextResponse.json(lead);
  } catch (error) {
    console.error('POST /api/leads/[id]/assign error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}