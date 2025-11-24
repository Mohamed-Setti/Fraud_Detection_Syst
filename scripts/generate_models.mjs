/**
 * Complete Model Generator - Generates ALL models according to diagram
 * This script will OVERWRITE all model files including User.ts and Transaction.ts
 * 
 * Usage:
 *   node scripts/generate_all_models.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.join(__dirname, '..', 'src', 'app', 'Models');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('✅ Created directory', outDir);
}

const files = {
  'enums.ts': `// Common enums used by models
export const TypeTransaction = {
  CASH_OUT: 'CASH_OUT',
  PAYMENT: 'PAYMENT',
  CASH_IN: 'CASH_IN',
  TRANSFER: 'TRANSFER',
  DEBIT: 'DEBIT',
  OTHER: 'OTHER'
} as const;

export const StatutTransaction = {
  EN_ATTENTE: 'EN_ATTENTE',
  VALIDEE: 'VALIDEE',
  REFUSEE: 'REFUSEE',
  SUSPECTE: 'SUSPECTE',
  ANNULEE: 'ANNULEE'
} as const;

export const NiveauRisque = {
  FAIBLE: 'FAIBLE',
  MOYEN: 'MOYEN',
  ELEVE: 'ELEVE',
  CRITIQUE: 'CRITIQUE'
} as const;

export const TypeCompte = {
  COURANT: 'COURANT',
  EPARGNE: 'EPARGNE',
  PROFESSIONNEL: 'PROFESSIONNEL',
  MARCHAND: 'MARCHAND'
} as const;

export const Channel = {
  ONLINE: 'online',
  BRANCH: 'branch',
  ATM: 'atm',
  POS: 'pos',
  MOBILE: 'mobile'
} as const;

export const AlertStatus = {
  OPEN: 'open',
  VALIDATED: 'validated',
  REJECTED: 'rejected',
  CLOSED: 'closed'
} as const;

export const AlertLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  CRITICAL: 'critical'
} as const;

export const UserRole = {
  CLIENT: 'client',
  TECHNICIEN: 'technicien',
  ANALYSTE_FINANCIERE: 'analystefinanciere',
  ADMIN: 'admin'
} as const;
`,

  'User.ts': `import mongoose from 'mongoose';
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
`,

  'Compte.ts': `import mongoose from 'mongoose';
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
`,

  'Transaction.ts': `import mongoose from 'mongoose';
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
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ compteSource: 1 });
TransactionSchema.index({ statut: 1 });
TransactionSchema.index({ isFraud: 1 });

// Methods
TransactionSchema.methods.markAsFraud = function(score?: number, details?: any) {
  this.isFraud = true;
  this.statut = StatutTransaction.SUSPECTE;
  if (score !== undefined) this.riskScore = score;
  if (details) this.mlDetails = Object.assign(this.mlDetails || {}, details);
  return this.save();
};

TransactionSchema.methods.valider = function() {
  this.statut = StatutTransaction.VALIDEE;
  return this.save();
};

TransactionSchema.methods.annuler = function() {
  this.statut = StatutTransaction.ANNULEE;
  return this.save();
};

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
`,

  'Anomalie.ts': `import mongoose from 'mongoose';
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
`,

  'Alert.ts': `import mongoose from 'mongoose';
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
`,

  'SnapshotSolde.ts': `import mongoose from 'mongoose';

export interface ISnapshotSolde extends mongoose.Document {
  transaction: mongoose.Types.ObjectId;
  idSnapshot?: number;
  account: mongoose.Types.ObjectId;
  oldBalance: number;
  newBalance: number;
  timestamp: Date;
}

const SnapshotSoldeSchema = new mongoose.Schema<ISnapshotSolde>({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  idSnapshot: { type: Number },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte', required: true },
  oldBalance: { type: Number, required: true },
  newBalance: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

SnapshotSoldeSchema.index({ transaction: 1, account: 1 });

SnapshotSoldeSchema.statics.capture = async function(transaction: any, account: any, oldBalance: number, newBalance: number) {
  return this.create({
    transaction: transaction._id,
    account: account._id,
    oldBalance,
    newBalance,
    timestamp: new Date()
  });
};

export default mongoose.model<ISnapshotSolde>('SnapshotSolde', SnapshotSoldeSchema);
`,

  'Notification.ts': `import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
  destinataire: mongoose.Types.ObjectId;
  sujet: string;
  message: string;
  niveau: 'info' | 'warning' | 'critical';
  lu: boolean;
  meta?: any;
  createdAt: Date;
  
  markRead(): Promise<INotification>;
  markUnread(): Promise<INotification>;
}

const NotificationSchema = new mongoose.Schema<INotification>({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sujet: { type: String, required: true },
  message: { type: String, required: true },
  niveau: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  lu: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

NotificationSchema.index({ destinataire: 1, lu: 1 });

NotificationSchema.methods.markRead = function() {
  this.lu = true;
  return this.save();
};

NotificationSchema.methods.markUnread = function() {
  this.lu = false;
  return this.save();
};

export default mongoose.model<INotification>('Notification', NotificationSchema);
`,

  'Rapport.ts': `import mongoose from 'mongoose';

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
`,

  'TransactionData.ts': `import mongoose from 'mongoose';

export interface ITransactionData {
  step: number;
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
}

export class TransactionData {
  step: number;
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
  
  constructor(data: ITransactionData) {
    this.step = data.step;
    this.amount = data.amount;
    this.nameOrig = data.nameOrig;
    this.oldbalanceOrg = data.oldbalanceOrg;
    this.newbalanceOrig = data.newbalanceOrig;
    this.nameDest = data.nameDest;
    this.oldbalanceDest = data.oldbalanceDest;
    this.newbalanceDest = data.newbalanceDest;
  }
  
  toMap(): Record<string, any> {
    return {
      step: this.step,
      amount: this.amount,
      nameOrig: this.nameOrig,
      oldbalanceOrg: this.oldbalanceOrg,
      newbalanceOrig: this.newbalanceOrig,
      nameDest: this.nameDest,
      oldbalanceDest: this.oldbalanceDest,
      newbalanceDest: this.newbalanceDest
    };
  }
  
  static async fromTransaction(transaction: any): Promise<TransactionData> {
    const Compte = mongoose.model('Compte');
    const compteSource = await Compte.findById(transaction.compteSource);
    const compteDest = await Compte.findById(transaction.compteDestination);
    
    return new TransactionData({
      step: transaction.step || 0,
      amount: transaction.amount,
      nameOrig: compteSource?.numeroCompte || 'UNKNOWN',
      oldbalanceOrg: transaction.oldBalanceSource || 0,
      newbalanceOrig: transaction.newBalanceSource || 0,
      nameDest: compteDest?.numeroCompte || 'UNKNOWN',
      oldbalanceDest: transaction.oldBalanceDest || 0,
      newbalanceDest: transaction.newBalanceDest || 0
    });
  }
}

export default TransactionData;
`,

  'SystemeML.ts': `export interface TransactionDataML {
  step: number;
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
}

export interface MLPrediction {
  isFraud: boolean;
  score: number;
  confidence: number;
  details?: any;
}

export class SystemeML {
  private urlAPI: string;
  private cleAPI: string;
  
  constructor(urlAPI: string, cleAPI: string) {
    this.urlAPI = urlAPI;
    this.cleAPI = cleAPI;
  }
  
  async analyserTransactionData(data: TransactionDataML): Promise<MLPrediction> {
    const response = await fetch(this.urlAPI + '/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cleAPI
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
  
  async detecterFraude(transactionData: TransactionDataML): Promise<boolean> {
    const prediction = await this.analyserTransactionData(transactionData);
    return prediction.isFraud;
  }
  
  async detecterAnomalies(transactions: TransactionDataML[]): Promise<any[]> {
    const response = await fetch(this.urlAPI + '/detect-anomalies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cleAPI
      },
      body: JSON.stringify({ transactions })
    });
    return await response.json();
  }
  
  async entrainerModele(dataset: TransactionDataML[]): Promise<any> {
    const response = await fetch(this.urlAPI + '/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.cleAPI
      },
      body: JSON.stringify({ dataset })
    });
    return await response.json();
  }
}

export default SystemeML;
`
};

console.log('\n🚀 GENERATING ALL MODELS...\n');

let created = 0;

for (const [name, content] of Object.entries(files)) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log(`✅ CREATED/UPDATED: ${name}`);
  created++;
}

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY:');
console.log('='.repeat(60));
console.log(`✅ Files created/updated: ${created}`);
console.log(`📁 Output directory: ${outDir}`);
console.log('\n💡 Next steps:');
console.log('   1. Review the generated models');
console.log('   2. Install dependencies: npm install bcrypt mongoose');
console.log('   3. Test your models with your database');
console.log('='.repeat(60) + '\n');