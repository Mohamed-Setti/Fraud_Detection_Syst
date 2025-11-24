import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  passwordHash: String,
  role: String,
  isAuthenticated: Boolean,
  createdAt: Date,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
