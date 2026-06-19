import mongoose from 'mongoose';

// ======================
// LEAD HISTORY (append-only pipeline log)
// One document per lead activity. Never updated, only inserted.
// ======================
const LeadHistorySchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },

    // Who performed the action. Null = system / public form submission.
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Denormalised snapshot so history survives if the actor is later deleted.
    actorName: { type: String, default: 'System' },

    action: {
      type: String,
      enum: [
        'created',          // lead first entered the system
        'assigned',         // assigned to an agent (from unassigned)
        'transferred',      // moved from one agent to another
        'unassigned',       // owner removed
        'status_changed',   // pipeline status moved
        'note_added',       // remark / note added
        'follow_up',        // callback / follow-up scheduled
        'field_updated',    // one or more detail fields edited
      ],
      required: true,
    },

    // Optional context for the action.
    field: { type: String, default: '' },
    from: { type: mongoose.Schema.Types.Mixed, default: null },
    to: { type: mongoose.Schema.Types.Mixed, default: null },
    note: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.LeadHistory || mongoose.model('LeadHistory', LeadHistorySchema);
