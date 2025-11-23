import mongoose from 'mongoose';

const AnomalieSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  scoreRisque: { type: Number, default: 0 },
  description: { type: String },
  dateDetection: { type: Date, default: Date.now },
  etatValide: { type: Boolean, default: false },
  niveau: { type: String, enum: ['FAIBLE','MOYEN','ELEVE','CRITIQUE'], default: 'FAIBLE' },
  isFraudConfirmed: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed }
});

AnomalieSchema.methods.validate = function(){
  this.etatValide = true;
  return this.save();
};

AnomalieSchema.methods.confirmFraud = function(){
  this.isFraudConfirmed = true;
  return this.save();
};

const Anomalie = mongoose.model('Anomalie', AnomalieSchema);

export default mongoose.models.Anomalie || Anomalie;