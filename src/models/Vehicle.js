import mongoose, { Schema } from 'mongoose';

const VehicleSchema = new Schema({
  plate: { type: String, required: true, unique: true },
  model: String,
  category: { type: String, enum: ['automobile', 'Truck', 'isuzzu', 'bus','forklift','fsr','other'] },
  fuelType: { type: String, enum: ['Benzin', 'Nafta'], required: true },
  odometer: {type: Boolean, default: true}
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema); 