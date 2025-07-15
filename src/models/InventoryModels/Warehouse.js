import mongoose, { Schema } from 'mongoose';
import User from '../User';

const WarehouseSchema = new Schema({
  name: { type: String, required: true },
  location: String,
  managerId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);