import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 3600
    }
  }, { timestamps: true });

export default mongoose.models.Token || mongoose.model('Token', tokenSchema);