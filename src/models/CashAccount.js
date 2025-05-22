import mongoose, { Schema } from 'mongoose';

const CashAccountSchema = new Schema({
  name: { type: String, required: true },
  balance: { type: Number, default: 0 },
  
  lastReplenish: Date,
}, { timestamps: true });

export default mongoose.models.CashAccount || mongoose.model('CashAccount', CashAccountSchema); 