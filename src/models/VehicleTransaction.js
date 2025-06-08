import mongoose, { Schema } from 'mongoose';

const VehicleTransactionSchema = new Schema({
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    date: { type: Date, required: true },
    amount: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    
}, { timestamps: true });

const VehicleTransaction = mongoose.models.VehicleTransaction || mongoose.model('VehicleTransaction', VehicleTransactionSchema);

export default VehicleTransaction;
