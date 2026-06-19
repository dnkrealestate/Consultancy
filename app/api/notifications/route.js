import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import Lead from '@/models/Lead';
import User from '@/models/User'; // ensure registered for populate
import { getAuthUser } from '@/lib/auth';

// GET /api/notifications
// Returns this user's recent notifications, the unread count, and the
// leads whose follow-up (callbackDate) falls today — computed live,
// role-scoped (agents only see their own).
export async function GET(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ user: me._id }).populate('lead', 'name').sort({ createdAt: -1 }).limit(30),
      Notification.countDocuments({ user: me._id, read: false }),
    ]);

    // Today's follow-ups (00:00 → 24:00 local-ish, server time).
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(end.getDate() + 1);

    const leadQuery = {
      callbackDate: { $gte: start, $lt: end },
      status: { $nin: ['Closed', 'Lost'] },
    };
    if (me.role === 'agent') leadQuery.assignedTo = me._id;

    const followUps = await Lead.find(leadQuery)
      .select('name phone status callbackDate assignedTo')
      .populate('assignedTo', 'name')
      .sort({ callbackDate: 1 })
      .limit(50);

    return NextResponse.json({ notifications, unreadCount, followUps });
  } catch (error) {
    console.error('GET /api/notifications error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/notifications  → mark read. Body: { id } or { all: true }.
export async function PUT(req) {
  await dbConnect();
  const me = await getAuthUser(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, all } = await req.json();
    if (all) {
      await Notification.updateMany({ user: me._id, read: false }, { $set: { read: true } });
    } else if (id) {
      await Notification.updateOne({ _id: id, user: me._id }, { $set: { read: true } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/notifications error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}