import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';
import { getAuthUser } from '@/lib/auth';

// POST /api/push/subscribe — save or refresh a push subscription
export async function POST(req) {
  try {
    await dbConnect();
    const me = await getAuthUser(req);
    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys, userId: me?._id ?? null },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('subscribe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/push/subscribe — remove a subscription (on logout / permission revoke)
export async function DELETE(req) {
  try {
    await dbConnect();
    const { endpoint } = await req.json();
    if (endpoint) await PushSubscription.deleteOne({ endpoint });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
