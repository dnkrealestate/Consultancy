import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  profileImage: { type: String }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
