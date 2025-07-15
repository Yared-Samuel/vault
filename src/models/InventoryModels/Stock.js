import mongoose, { Schema } from 'mongoose';

const StockSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0 },
  minStockAlert: Number,
  lastUpdated: Date
}, { timestamps: true });

StockSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

export default mongoose.models.Stock || mongoose.model('Stock', StockSchema);