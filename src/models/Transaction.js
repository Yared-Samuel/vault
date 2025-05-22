import {
  transactionStatusesModel,
  transactionTypesModel,
} from "@/lib/constants";
import mongoose, { Schema } from "mongoose";

const TransactionSchema = new Schema(
  
  {
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
    to: { type: String  },
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
    recept_reference: { type: String }, // For Receipt_Payment and Suspense_Payment also check_payment


    // For rejection
    // status will be rejected here
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedReason: { type: String },

    // For Transporter
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    // when status is paid
    serialNumber: { type: Number, unique: true, sparse: true },
    quantity: { type: Number },

  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
