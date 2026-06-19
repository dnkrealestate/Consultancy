import mongoose from 'mongoose';
import { ROLES, DEFAULT_MODULES_BY_ROLE } from '../lib/permissions';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // ──────────────────────────────────────
    // ROLE — admin | agent | content_writer | back_office
    // ──────────────────────────────────────
    role: {
      type: String,
      enum: ROLES,
      default: 'admin',
    },

    // ──────────────────────────────────────
    // MODULE PERMISSIONS
    // Which admin modules this user may access, e.g. ['leads', 'blogs'].
    // Admins bypass this list entirely (full access).
    // ──────────────────────────────────────
    modules: {
      type: [String],
      default: [],
    },

    // Inactive users cannot log in.
    active: {
      type: Boolean,
      default: true,
    },

    resetToken: { type: String },
  },
  { timestamps: true }
);

// Default a user's modules from their role when none were provided.
UserSchema.pre('validate', function applyDefaultModules() {
  if (this.role !== 'admin' && (!this.modules || this.modules.length === 0)) {
    this.modules = DEFAULT_MODULES_BY_ROLE[this.role] || [];
  }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
