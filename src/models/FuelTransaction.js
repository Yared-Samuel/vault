import mongoose, { Schema } from 'mongoose';

const FuelTransactionSchema = new Schema({
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  pumpedAt: { type: Date, required: true },
  odometer: { type: Number, required: true },
  liters: { type: Number, required: true },
  km_lit: { type: Number },
  pricePerLiter: { type: Number, required: true },
  totalCost: { type: Number },
  type: {type: String, enum: ["fuel", "other"], default: "fuel"},
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  station: { type: String, enum: ["A", "B", "C"], default: "A"},
}, { timestamps: true });

export default mongoose.models.FuelTransaction || mongoose.model('FuelTransaction', FuelTransactionSchema); 