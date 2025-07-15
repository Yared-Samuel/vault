import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, unique: true },
    category: String,
    brand: String,
    unit: String,
    barcode: String,
    price: Number,
    cost: Number
  }, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;