import mongoose from 'mongoose';

// ======================
// SEO META — per-page SEO content, editable from the admin panel.
// One document per route path (e.g. '/', '/about', '/services').
// ======================
const SeoMetaSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, trim: true },

    title: { type: String, default: '' },
    description: { type: String, default: '' },
    keywords: { type: [String], default: [] },

    // Open Graph / social overrides (fall back to title/description).
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },

    canonical: { type: String, default: '' },
    noindex: { type: Boolean, default: false },

    // Optional raw JSON-LD structured data for this page.
    jsonLd: { type: String, default: '' },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export default mongoose.models.SeoMeta || mongoose.model('SeoMeta', SeoMetaSchema);
