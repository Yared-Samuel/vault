import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    cpv: { type: Number, default: 0 },
    pcpv: { type: Number, default: 0 },
  });
  
  export default mongoose.models.Counter || mongoose.model("Counter", counterSchema);