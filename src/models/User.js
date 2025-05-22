import mongoose, { Schema } from 'mongoose';
import { userRoles } from '@/lib/constants';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: userRoles, required: true },
  password: {
    type: String,
    required: [true, "Please add a Password"],
    minLength: [6, "Password must be up to 6 characters"],
    select: false,
  },
  lastLogin: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema); 