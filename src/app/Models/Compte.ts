import mongoose from 'mongoose';
import { TypeCompte } from './enums';

export interface ICompte extends mongoose.Document {
  nameAccount: string;
  numeroCompte: string;
  soldeActuel: number;
  typeCompte: keyof typeof TypeCompte;
  dateCreation: Date;
  devise: string;
  limiteDailyTransfer: number;
  totalTransferToday: number;
  owner: mongoose.Types.ObjectId;
  metadata?: any;
  
  // Methods
  applyTransaction(amount: number): Promise<ICompte>;
  deposer(montant: number): Promise<ICompte>;
  retirer(montant: number): Promise<ICompte>;
  verifierLimite(montant: number): boolean;
  resetLimitesQuotidiennes(): Promise<ICompte>;
  consulterHistorique(): Promise<any[]>;
}

const CompteSchema = new mongoose.Schema<ICompte>({
  nameAccount: { type: String, required: true },
  numeroCompte: { type: String, required: true, unique: true },
  soldeActuel: { type: Number, default: 0 },
  typeCompte: { 
    type: String, 
    enum: Object.values(TypeCompte), 
    default: TypeCompte.COURANT 
  },
  dateCreation: { type: Date, default: Date.now },
  devise: { type: String, default: 'EUR' },
  limiteDailyTransfer: { type: Number, default: 10000 },
  totalTransferToday: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes
CompteSchema.index({ numeroCompte: 1 });
CompteSchema.index({ owner: 1 });

// Methods
CompteSchema.methods.applyTransaction = function(amount: number) {
  this.soldeActuel += amount;
  return this.save();
};

CompteSchema.methods.deposer = function(montant: number) {
  if (montant <= 0) throw new Error('Le montant doit être positif');
  this.soldeActuel += montant;
  return this.save();
};

CompteSchema.methods.retirer = function(montant: number) {
  if (montant <= 0) throw new Error('Le montant doit être positif');
  if (this.soldeActuel < montant) throw new Error('Solde insuffisant');
  this.soldeActuel -= montant;
  return this.save();
};

CompteSchema.methods.verifierLimite = function(montant: number): boolean {
  return (this.totalTransferToday + montant) <= this.limiteDailyTransfer;
};

CompteSchema.methods.resetLimitesQuotidiennes = function() {
  this.totalTransferToday = 0;
  return this.save();
};

CompteSchema.methods.consulterHistorique = async function() {
  const Transaction = mongoose.model('Transaction');
  return Transaction.find({
    $or: [{ compteSource: this._id }, { compteDestination: this._id }]
  }).sort({ date: -1 }).limit(50);
};

export default mongoose.model<ICompte>('Compte', CompteSchema);
