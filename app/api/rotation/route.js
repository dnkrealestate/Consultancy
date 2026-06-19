import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import RotationSetting from '@/models/RotationSetting';
import { getAuthUser } from '@/lib/auth';
import { getRotationSetting } from '@/lib/rotation';

// GET /api/rotation  → current rotation config (admin only).
export async function GET(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const setting = await getRotationSetting();
  await setting.populate('agents', 'name email role active');

  return NextResponse.json({
    enabled: setting.enabled,
    agents: setting.agents,
    lastIndex: setting.lastIndex,
  });
}

// PUT /api/rotation  → update rotation config (admin only).
// Body: { enabled: boolean, agents: [userId] }
export async function PUT(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (me.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { enabled, agents } = await req.json();
    const setting = await getRotationSetting();

    if (enabled !== undefined) setting.enabled = !!enabled;

    if (Array.isArray(agents)) {
      // Only genuine, active agents may be in the rotation pool.
      const valid = await User.find({
        _id: { $in: agents },
        role: 'agent',
        active: true,
      }).select('_id');
      const validIds = valid.map((u) => String(u._id));
      const newPool = agents.map(String).filter((id) => validIds.includes(id));

      const changed =
        newPool.length !== setting.agents.length ||
        newPool.some((id, i) => id !== String(setting.agents[i]));

      setting.agents = newPool;
      // Reset the pointer when the pool changes so distribution stays fair.
      if (changed) setting.lastIndex = -1;
    }

    await setting.save();
    await setting.populate('agents', 'name email role active');

    return NextResponse.json({
      enabled: setting.enabled,
      agents: setting.agents,
      lastIndex: setting.lastIndex,
    });
  } catch (error) {
    console.error('PUT /api/rotation error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}