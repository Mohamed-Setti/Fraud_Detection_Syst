import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from './enums';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: keyof typeof UserRole;
  metadata?: any;
  createdAt: Date;
  
  // Methods
  comparePassword(candidate: string): Promise<boolean>;
  isAuthentifier(): boolean;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
  type: String, 
  enum: Object.values(UserRole), 
  default: UserRole.CLIENT 
},
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// Hash password before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Check if user is authenticated
UserSchema.methods.isAuthentifier = function(): boolean {
  return !!this._id;
};

export default mongoose.model<IUser>('User', UserSchema);
