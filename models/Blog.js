import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    thumbnail: { type: String, required: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Business Setup', 'Visas', 'Banking', 'Tax & Accounting', 'Other'],
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    readTime: { type: String },
    views: { type: Number, default: 0 },
    viewedIPs: [{ type: String }],
    seoMetadata: {
      title: { type: String },
      description: { type: String },
      keywords: { type: String },
    },
  },
  { timestamps: true }
);

delete mongoose.models.Blog;
export default mongoose.model('Blog', BlogSchema);