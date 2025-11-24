import mongoose from 'mongoose';
import { NiveauRisque } from './enums';

export interface IAnomalie extends mongoose.Document {
  transaction: mongoose.Types.ObjectId;
  scoreRisque: number;
  description?: string;
  dateDetection: Date;
  etatValide: boolean;
  niveau: keyof typeof NiveauRisque;
  isFraudConfirmed: boolean;
  meta?: any;
  
  validate(): Promise<IAnomalie>;
  confirmFraud(): Promise<IAnomalie>;
  reject(): Promise<IAnomalie>;
}

const AnomalieSchema = new mongoose.Schema<IAnomalie>({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  scoreRisque: { type: Number, default: 0, min: 0, max: 100 },
  description: { type: String },
  dateDetection: { type: Date, default: Date.now },
  etatValide: { type: Boolean, default: false },
  niveau: { type: String, enum: Object.values(NiveauRisque), default: NiveauRisque.FAIBLE },
  isFraudConfirmed: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

AnomalieSchema.index({ transaction: 1 });
AnomalieSchema.index({ niveau: 1 });

AnomalieSchema.methods.validate = function() {
  this.etatValide = true;
  return this.save();
};

AnomalieSchema.methods.confirmFraud = function() {
  this.isFraudConfirmed = true;
  this.etatValide = true;
  return this.save();
};

AnomalieSchema.methods.reject = function() {
  this.isFraudConfirmed = false;
  this.etatValide = true;
  return this.save();
};

export default mongoose.model<IAnomalie>('Anomalie', AnomalieSchema);
