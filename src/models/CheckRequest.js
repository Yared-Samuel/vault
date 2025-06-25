import mongoose, { Schema } from "mongoose";
import { checkTypes } from "@/lib/constants";

const CheckRequestSchema = new Schema(
  {

    type: {
      type: String,
      enum: checkTypes.map(type => type.value),
      required: true,
    },
    status: {
      type: String,
      enum: [ "prepared",  "paid", "rejected"],
      default: "prepared",
    },
    checkNumber: { type: String, required: true , unique: true},
    bank: {
      type: String,
      enum: ["awash", "dashin", "cbe", "united"],
      required: true,
    },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.CheckRequest ||
  mongoose.model("CheckRequest", CheckRequestSchema);
