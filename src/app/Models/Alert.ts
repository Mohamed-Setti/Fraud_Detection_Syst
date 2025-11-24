import mongoose from 'mongoose';
import { AlertStatus, AlertLevel } from './enums';

export interface IAlert extends mongoose.Document {
  transaction: mongoose.Types.ObjectId;
  anomalie?: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  niveau: keyof typeof AlertLevel;
  status: keyof typeof AlertStatus;
  assignedTo?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  resolvedAt?: Date;
  
  assign(userId: mongoose.Types.ObjectId): Promise<IAlert>;
  resolve(notes?: string): Promise<IAlert>;
  reject(notes?: string): Promise<IAlert>;
  close(): Promise<IAlert>;
}

const AlertSchema = new mongoose.Schema<IAlert>({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  anomalie: { type: mongoose.Schema.Types.ObjectId, ref: 'Anomalie' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  niveau: { type: String, enum: Object.values(AlertLevel), default: AlertLevel.LOW },
  status: { type: String, enum: Object.values(AlertStatus), default: AlertStatus.OPEN },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

AlertSchema.index({ transaction: 1 });
AlertSchema.index({ status: 1 });

AlertSchema.methods.assign = function(userId: mongoose.Types.ObjectId) {
  this.assignedTo = userId;
  return this.save();
};

AlertSchema.methods.resolve = function(notes?: string) {
  this.status = AlertStatus.VALIDATED;
  this.resolvedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

AlertSchema.methods.reject = function(notes?: string) {
  this.status = AlertStatus.REJECTED;
  this.resolvedAt = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

AlertSchema.methods.close = function() {
  this.status = AlertStatus.CLOSED;
  this.resolvedAt = new Date();
  return this.save();
};

export default mongoose.model<IAlert>('Alert', AlertSchema);
