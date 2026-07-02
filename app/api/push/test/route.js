// GET /api/push/test — shows subscription count + sends a test push to all
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';
import { sendPushToAll } from '@/lib/push';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const me = await getAuthUser(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const subs = await PushSubscription.find({}, 'endpoint createdAt').lean();

    await sendPushToAll({
      title: '✅ Push Test',
      body: 'DNK CRM push notifications are working!',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'push-test',
      url: '/crm',
      requireInteraction: false,
    });

    return NextResponse.json({
      subscriptions: subs.length,
      endpoints: subs.map(s => ({ short: s.endpoint.slice(-30), createdAt: s.createdAt })),
      vapidPublicKeySet: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
