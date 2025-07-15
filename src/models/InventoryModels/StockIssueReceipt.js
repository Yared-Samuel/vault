import mongoose, { Schema } from 'mongoose';

const StockIssueReceiptSchema = new Schema({
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  supplierName: String,
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    cost: Number
  }],
  receiptDate: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

export default mongoose.models.StockIssueReceipt || mongoose.model('StockIssueReceipt', StockIssueReceiptSchema);