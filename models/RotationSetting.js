import mongoose from 'mongoose';

// ======================
// LEAD ROTATION SETTINGS (single global document)
// Controls automatic round-robin distribution of new leads.
// ======================
const RotationSettingSchema = new mongoose.Schema(
  {
    // Singleton key — there is only ever one rotation config.
    key: { type: String, default: 'global', unique: true },

    // Master on/off switch. Admin can toggle at any time.
    enabled: { type: Boolean, default: false },

    // Ordered pool of agents that share incoming leads.
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Round-robin pointer — index of the agent who received the last lead.
    lastIndex: { type: Number, default: -1 },

    // Minutes before an unattended assigned lead is reassigned to the next agent.
    // 0 = feature disabled.
    nonAttendedTimeoutMinutes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.RotationSetting || mongoose.model('RotationSetting', RotationSettingSchema);