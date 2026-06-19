import Notification from '../models/Notification';
import User from '../models/User';

// Create one notification for a single recipient. Best-effort:
// notification failures must never break the primary action.
export async function createNotification({ user, type, lead, title, message, meta }) {
  if (!user || !type || !title) return;
  try {
    await Notification.create({
      user,
      type,
      lead: lead || null,
      title,
      message: message || '',
      meta: meta || null,
    });
  } catch (err) {
    console.error('createNotification failed:', err.message);
  }
}

// Fan-out a notification to every active admin (e.g. new lead, status change).
export async function notifyAdmins({ type, lead, title, message, meta }) {
  try {
    const admins = await User.find({ role: 'admin', active: true }).select('_id');
    await Promise.all(
      admins.map((a) => createNotification({ user: a._id, type, lead, title, message, meta }))
    );
  } catch (err) {
    console.error('notifyAdmins failed:', err.message);
  }
}