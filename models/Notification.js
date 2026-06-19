import mongoose from 'mongoose';

// ======================
// NOTIFICATION
// One per recipient per event. Follow-up reminders are computed live
// (see the notifications API) and are NOT stored here.
// ======================
const NotificationSchema = new mongoose.Schema(
  {
    // Recipient.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['lead_assigned', 'new_lead', 'status_change', 'follow_up'],
      required: true,
    },

    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },

    title: { type: String, required: true },
    message: { type: String, default: '' },

    read: { type: Boolean, default: false, index: true },

    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema);