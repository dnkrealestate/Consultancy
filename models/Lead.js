import mongoose from 'mongoose';

// ======================
// NOTE SUB SCHEMA
// ======================
const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ======================
// ASSIGNMENT HISTORY SUB SCHEMA
// Records every owner this lead has had + how it was assigned.
// ======================
const AssignmentSchema = new mongoose.Schema(
  {
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    method: { type: String, enum: ['manual', 'rotation'], default: 'manual' },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ======================
// MAIN LEAD SCHEMA
// ======================
const LeadSchema = new mongoose.Schema(
  {
    // ── BASIC INFO ───────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, default: '' },

    // ── SERVICE / SOURCE ─────────────────────────────────
    service: { type: String, default: '', trim: true },
    freezone: { type: String, default: '', trim: true },
    offshoreJurisdiction: { type: String, default: '', trim: true },
    purpose: { type: String, default: '', trim: true },

    // ── BUSINESS INFO ────────────────────────────────────
    companyName: { type: String, default: '' },
    businessCategory: { type: String, default: '' },
    businessActivity: { type: String, default: '' },
    shareholders: { type: String, default: '' },
    officeSpace: { type: String, default: '' },
    expertCall: { type: String, default: '' },
    startLocation: { type: String, default: '' },
    nationality: { type: String, default: '' },
    timeline: { type: String, default: '' },

    // ── BACKWARD COMPATIBILITY ───────────────────────────
    businessType: { type: String, default: '' },
    investmentRange: { type: String, default: '' },

    // ── SERVICES ARRAY (multi-select) ────────────────────
    services: { type: [String], default: [] },

    // ── CALLBACK ─────────────────────────────────────────
    callbackDate: { type: Date },

    // ── NOTES ────────────────────────────────────────────
    notes: { type: [NoteSchema], default: [] },

    // ── STATUS ───────────────────────────────────────────
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Closed', 'Lost'],
      default: 'New',
    },

    // ──────────────────────────────────────────────────────
    // OWNERSHIP / ASSIGNMENT  ← NEW
    // assignedTo: the agent who currently owns this lead.
    // assignmentHistory: full ownership trail (who, by whom, how).
    // ──────────────────────────────────────────────────────
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignmentHistory: {
      type: [AssignmentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// ======================
// IMPORTANT FIX FOR NEXT.JS HOT RELOAD
// ======================
if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}

const Lead = mongoose.model('Lead', LeadSchema);
export default Lead;