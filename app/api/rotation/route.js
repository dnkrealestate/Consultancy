import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import RotationSetting from '@/models/RotationSetting';
import { getAuthUser } from '@/lib/auth';

// Returns the raw MongoDB document (no Mongoose schema processing).
// Using the native driver ensures fields added to the schema after the
// document was first created are never stripped or hidden.
async function readRaw() {
  await dbConnect();
  const col = mongoose.connection.collection('rotationsettings');
  let doc = await col.findOne({ key: 'global' });
  if (!doc) {
    // First-time setup via Mongoose so defaults + validators apply.
    const created = await RotationSetting.create({ key: 'global' });
    doc = created.toObject();
  }
  return doc;
}

// Populate the agents array on a plain object (can't use .populate on a raw doc).
async function populateAgents(agentIds = []) {
  if (!agentIds.length) return [];
  const ids = agentIds.map((id) => new mongoose.Types.ObjectId(String(id)));
  return User.find({ _id: { $in: ids } })
    .select('name email role active')
    .lean();
}

// GET /api/rotation  → current rotation config (admin only).
export async function GET(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const doc    = await readRaw();
  const agents = await populateAgents(doc.agents);

  return NextResponse.json({
    enabled:                   doc.enabled   ?? false,
    agents,
    lastIndex:                 doc.lastIndex ?? -1,
    nonAttendedTimeoutMinutes: doc.nonAttendedTimeoutMinutes ?? 0,
  });
}

// PUT /api/rotation  → update rotation config (admin only).
// Body: { enabled?: boolean, agents?: [userId], nonAttendedTimeoutMinutes?: number }
export async function PUT(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const { enabled, agents, nonAttendedTimeoutMinutes } = body;

    const $set = {};

    if (enabled !== undefined) $set.enabled = !!enabled;

    if (typeof nonAttendedTimeoutMinutes === 'number') {
      $set.nonAttendedTimeoutMinutes = Math.max(0, nonAttendedTimeoutMinutes);
    }

    if (Array.isArray(agents)) {
      // Validate: only genuine active agents may enter the pool.
      const valid = await User.find({
        _id: { $in: agents },
        role: 'agent',
        active: true,
      }).select('_id');
      const validIds = valid.map((u) => String(u._id));
      const newPool  = agents.map(String).filter((id) => validIds.includes(id));

      // Detect pool change to decide whether to reset the round-robin pointer.
      const cur     = await readRaw();
      const curPool = (cur?.agents ?? []).map(String);
      const changed =
        newPool.length !== curPool.length ||
        newPool.some((id, i) => id !== curPool[i]);

      // Store as ObjectIds so population works correctly.
      $set.agents = newPool.map((id) => new mongoose.Types.ObjectId(id));
      if (changed) $set.lastIndex = -1;
    }

    // Write directly through the native MongoDB driver.
    // This bypasses Mongoose's strict-mode field filtering entirely, so
    // fields added to the schema after the document was created (like
    // nonAttendedTimeoutMinutes) are always written — no silent drops.
    const col = mongoose.connection.collection('rotationsettings');
    await col.updateOne(
      { key: 'global' },
      { $set },
      { upsert: true }
    );

    // Read back via native driver and populate agents for the response.
    const doc    = await readRaw();
    const agentsPopulated = await populateAgents(doc.agents);

    return NextResponse.json({
      enabled:                   doc.enabled   ?? false,
      agents:                    agentsPopulated,
      lastIndex:                 doc.lastIndex ?? -1,
      nonAttendedTimeoutMinutes: doc.nonAttendedTimeoutMinutes ?? 0,
    });
  } catch (error) {
    console.error('PUT /api/rotation error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
