import mongoose, { Schema } from 'mongoose';

const SparePartSchema = new Schema({
  serial: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  quantityOnHand: { type: Number, default: 0 },
  department: String,
}, { timestamps: true });

export default mongoose.models.SparePart || mongoose.model('SparePart', SparePartSchema); 