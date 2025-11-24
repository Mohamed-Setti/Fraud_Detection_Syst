import mongoose from 'mongoose';

export interface IRapport extends mongoose.Document {
  titre: string;
  dateGeneration: Date;
  contenu: string;
  periode: string;
  type: 'fraud' | 'transaction' | 'account' | 'anomaly' | 'custom';
  generePar: mongoose.Types.ObjectId;
  meta?: any;
}

const RapportSchema = new mongoose.Schema<IRapport>({
  titre: { type: String, required: true },
  dateGeneration: { type: Date, default: Date.now },
  contenu: { type: String, required: true },
  periode: { type: String, required: true },
  type: { type: String, enum: ['fraud', 'transaction', 'account', 'anomaly', 'custom'], default: 'custom' },
  generePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meta: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

RapportSchema.index({ dateGeneration: -1 });
RapportSchema.index({ type: 1 });

export default mongoose.model<IRapport>('Rapport', RapportSchema);
