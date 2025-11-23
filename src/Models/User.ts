import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["CLIENT", "TECHNICIEN", "ANALYSTE", "ADMIN", "analystefinanciere"],
    required: true
  },
  isAuthenticated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
