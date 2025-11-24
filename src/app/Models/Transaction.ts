import mongoose from 'mongoose';
import { TypeTransaction, StatutTransaction, Channel } from './enums';

export interface ITransaction extends mongoose.Document {
  idTransaction?: number;
  step: number;
  user: mongoose.Types.ObjectId;
  compteSource: mongoose.Types.ObjectId;
  compteDestination: mongoose.Types.ObjectId;
  date: Date;
  amount: number;
  type: keyof typeof TypeTransaction;
  channel: keyof typeof Channel;
  statut: keyof typeof StatutTransaction;
  isFraud: boolean;
  riskScore: number;
  mlDetails?: any;
  description?: string;
  oldBalanceSource?: number;
  newBalanceSource?: number;
  oldBalanceDest?: number;
  newBalanceDest?: number;
  createdAt: Date;
  
  // Methods
  markAsFraud(score?: number, details?: any): Promise<ITransaction>;
  valider(): Promise<ITransaction>;
  annuler(): Promise<ITransaction>;
}

const TransactionSchema = new mongoose.Schema<ITransaction>({
  idTransaction: { type: Number },
  step: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  compteSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte', required: true },
  compteDestination: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte' },
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: Object.values(TypeTransaction), default: TypeTransaction.OTHER },
 channel: { type: String, enum: Object.values(Channel), default: Channel.ONLINE },
  statut: { type: String, enum: Object.values(StatutTransaction), default: StatutTransaction.EN_ATTENTE },
  isFraud: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0, min: 0, max: 100 },
  mlDetails: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
  oldBalanceSource: { type: Number },
  newBalanceSource: { type: Number },
  oldBalanceDest: { type: Number },
  newBalanceDest: { type: Number },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes
//TransactionSchema.index({ user: 1, date: -1 });
//TransactionSchema.index({ compteSource: 1 });
//TransactionSchema.index({ statut: 1 });
////TransactionSchema.index({ isFraud: 1 });

// Methods
//TransactionSchema.methods.markAsFraud = function(score?: number, details?: any) {
  ////this.isFraud = true;
  //this.statut = StatutTransaction.SUSPECTE;
  //if (score !== undefined) this.riskScore = score;
  //if (details) this.mlDetails = Object.assign(this.mlDetails || {}, details);
  //return this.save();
//};

//TransactionSchema.methods.valider = function() {
  //this.statut = StatutTransaction.VALIDEE;
  //return this.save();
//};


//TransactionSchema.methods.annuler = function() {
  //this.statut = StatutTransaction.ANNULEE;
  //return this.save();
//};
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export default Transaction;
