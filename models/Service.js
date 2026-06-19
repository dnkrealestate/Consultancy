import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  image: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
