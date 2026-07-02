import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { getRotationSetting } from '@/lib/rotation';
import { logHistory } from '@/lib/history';

// Pick the next agent in the pool that is NOT the current assignee.
// Does NOT advance the main rotation pointer — keeps normal distribution intact.
function pickNextExcluding(pool, excludeId) {
  if (pool.length <= 1) return null;
  const strPool = pool.map(String);
  const idx = strPool.indexOf(String(excludeId));
  // Walk forward from the current position to find someone else
  for (let i = 1; i < strPool.length; i++) {
    const candidate = strPool[(idx + i) % strPool.length];
    if (candidate !== String(excludeId)) return candidate;
  }
  return null;
}

// POST /api/cron/reassign-unattended
// Called by the admin layout every 60 s to auto-reassign unattended leads.
export async function POST() {
  try {
    await dbConnect();

    const setting = await getRotationSetting();
    const timeout = setting?.nonAttendedTimeoutMinutes;
    // Timeout feature works independently of the rotation master toggle.
    // Only skip when timeout is 0 (disabled) or no pool is configured.
    if (!timeout) {
      return NextResponse.json({ skipped: true, reason: 'timeout disabled' });
    }

    const pool = (setting.agents || []).map(String);
    if (pool.length < 2) {
      return NextResponse.json({ skipped: true, reason: 'pool too small' });
    }

    const cutoff = new Date(Date.now() - timeout * 60 * 1000);

    const unattended = await Lead.find({
      attended:   false,
      assignedTo: { $ne: null },
      createdAt:  { $lt: cutoff },
      status:     { $in: ['New', 'Contacted'] },
    }).limit(50);

    let reassigned = 0;
    for (const lead of unattended) {
      const nextId = pickNextExcluding(pool, lead.assignedTo);
      if (!nextId) continue;

      const prevId = String(lead.assignedTo);
      lead.assignedTo = nextId;
      lead.assignmentHistory.push({
        agent:      nextId,
        assignedBy: null,
        method:     'rotation',
        assignedAt: new Date(),
      });
      await lead.save();

      await logHistory(lead._id, null, 'transferred', {
        from: prevId,
        to:   nextId,
        meta: { reason: 'non_attended_timeout', timeoutMinutes: timeout },
      });

      reassigned++;
    }

    console.log(`[reassign] checked=${unattended.length} reassigned=${reassigned}`);
    return NextResponse.json({ reassigned, checked: unattended.length });
  } catch (err) {
    console.error('[reassign] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
