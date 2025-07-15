import mongoose, { Schema } from 'mongoose';

const StockSnapshotSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    snapshotDate: { type: Date, required: true },
    quantity: { type: Number, required: true }
  });
  
  StockSnapshotSchema.index({ productId: 1, warehouseId: 1, snapshotDate: 1 }, { unique: true });
  const StockSnapshot = mongoose.models.StockSnapshot || mongoose.model('StockSnapshot', StockSnapshotSchema);
  export default StockSnapshot;