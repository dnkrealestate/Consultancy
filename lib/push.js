import webpush from 'web-push';
import dbConnect from './db';
import PushSubscription from '@/models/PushSubscription';

webpush.setVapidDetails(
  'mailto:dnkrealestate2022@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function sendPushToAll(payload) {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    console.warn('[push] VAPID keys missing — skipping push');
    return;
  }
  try {
    await dbConnect();
    const subs = await PushSubscription.find({}).lean();
    console.log(`[push] Sending to ${subs.length} subscription(s):`, payload.title);

    if (!subs.length) {
      console.warn('[push] No subscriptions found — nobody will receive the notification');
      return;
    }

    const data = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subs.map(async sub => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, data);
          console.log('[push] Sent OK to', sub.endpoint.slice(-40));
        } catch (err) {
          console.error('[push] Failed for', sub.endpoint.slice(-40), '—', err.statusCode, err.body);
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ endpoint: sub.endpoint });
            console.log('[push] Removed stale subscription');
          }
          throw err;
        }
      })
    );

    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed) console.warn(`[push] ${failed}/${subs.length} failed`);
  } catch (err) {
    console.error('[push] sendPushToAll error:', err);
  }
}
