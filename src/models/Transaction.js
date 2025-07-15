import {
  paymentTypesModel,
  transactionStatusesModel,
  transactionTypesModel,
} from "@/lib/constants";
import mongoose, { Schema } from "mongoose";
import CheckRequest from "./CheckRequest";

const TransactionSchema = new Schema(
  {
    paymentType: {
      type: String,
      enum: paymentTypesModel.map((item) => item.value),
      required: true,
    },

    status: {
      type: String,
      enum: transactionStatusesModel,
      required: true,
    },

    type: {
      type: String,
      enum: transactionTypesModel,
      required: true,
    },
    amount: { type: Number, default: 0 },
    to: { type: String },
    reason: { type: String },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    relatedReceiptUrl: String,

    // For Check_Payment only
    checkRequestId: {
      type: Schema.Types.ObjectId,
      ref: "CheckRequest",
    },

    // For Suspense only
    suspenceAmount: { type: Number }, // only for suspence_payment
    returnAmount: { type: Number }, // only for suspence_payment

    // when Approving   // update the status to approved
    date: { type: Date, default: Date.now },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // For paid status only
    cashAccount: {
      type: Schema.Types.ObjectId,
      ref: "CashAccount",
    },
    recept_reference: { type: String , default: false}, // For Receipt_Payment and Suspense_Payment also check_payment

    // For rejection
    // status will be rejected here
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedReason: { type: String },

    // when status is paid
    serialNumber: { type: Number },
    checkSerialNumber: { type: Number },
    quantity: { type: Number, default: 1 },

    // For transporter only
    vehicleMaintenance: [
      {
        type: Schema.Types.ObjectId,
        ref: "VehicleTransaction"
      }
    ],

    // For vehicleMaintenance only
    vehicleTransaction: {
      type: Schema.Types.ObjectId,
      ref: "VehicleTransaction",
    },
    // for bank transfer
    bank: {
      type: String,
      enum: ["awash", "dashin", "cbe", "united"],
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
