import mongoose from 'mongoose';

enum TypeTransaction {
  OTHER = 'OTHER',
  TRANSFER = 'TRANSFER',
  PAYMENT = 'PAYMENT',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT'
}

enum StatutTransaction {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

const TransactionSchema = new mongoose.Schema({
  idTransaction: { type: Number },
  step: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  compteSource: { type: String },
  compteDestination: { type: String },
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(TypeTransaction), default: TypeTransaction.OTHER },
  channel: { type: String, enum: ['online','branch','atm','pos','mobile'], default: 'online' },
  statut: { type: String, enum: Object.values(StatutTransaction), default: StatutTransaction.EN_ATTENTE },
  isFraud: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  mlDetails: { type: mongoose.Schema.Types.Mixed },
  description: { type: String },
  balanceAfterSource: { type: Number },
  balanceAfterDestination: { type: Number },
  createdAt: { type: Date, default: Date.now }
});


const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export default Transaction;
