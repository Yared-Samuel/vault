import { transactionAction, vehicleComponents, vehicleComponentsCatagory } from '@/lib/constants';
import mongoose, { Schema } from 'mongoose';

const VehicleTransactionSchema = new Schema({
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    km: { type: Number, default: 0 },
    action: { type: String, enum: transactionAction.map((item) => item.value) },
    vehicleComponentCategory: { type: String, enum: vehicleComponentsCatagory.map((item) => item.key) },
    vehicleComponents: { type: String, enum: vehicleComponents.map((item) => item.key) },
    description: { type: String },
    amount: { type: Number, required: true },
    qty: { type: Number, default: 1 },
    
}, { timestamps: true });

const VehicleTransaction = mongoose.models.VehicleTransaction || mongoose.model('VehicleTransaction', VehicleTransactionSchema);

export default VehicleTransaction;
