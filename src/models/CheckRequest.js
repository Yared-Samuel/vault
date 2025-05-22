import mongoose, { Schema } from "mongoose";

const CheckRequestSchema = new Schema(
  {
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["purchase", "petty_cash", "fuel", "general"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved",  "paid", "rejected"],
      default: "pending",
    },
    checkNumber: { type: String, required: true , unique: true},
    bank: {
      type: String,
      enum: ["awash", "dashin", "cbe", "united"],
      required: true,
    },
    to: { type: String, required: true },
    reason: { type: String, required: true },
    issuedAt: Date,
    paidAt: Date,
    notes: String,
    dedicatedFuelAccount: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.CheckRequest ||
  mongoose.model("CheckRequest", CheckRequestSchema);
