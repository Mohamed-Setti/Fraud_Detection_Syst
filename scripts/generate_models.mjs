/**
 * ESM-ready script to generate Mongoose model files under ../src/app/Models
 *
 * Usage:
 *   node scripts/generate_models.mjs
 *
 * If your project uses CommonJS (package.json "type": "commonjs"), you can
 * instead run a CommonJS variant. This script uses import.meta.url to derive
 * the current directory so it works when Node runs in ESM mode.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust output directory as in your error message
const outDir = path.join(__dirname, '..', 'src', 'app', 'Models');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Created directory', outDir);
}

const files = {
  'enums.ts': `// Common enums used by models
module.exports = {
  TypeTransaction: {
    CASH_OUT: 'CASH_OUT',
    PAYMENT: 'PAYMENT',
    CASH_IN: 'CASH_IN',
    TRANSFER: 'TRANSFER',
    DEBIT: 'DEBIT',
    OTHER: 'OTHER'
  },
  StatutTransaction: {
    EN_ATTENTE: 'EN_ATTENTE',
    VALIDEE: 'VALIDEE',
    REFUSEE: 'REFUSEE',
    SUSPECTE: 'SUSPECTE',
    ANNULEE: 'ANNULEE'
  },
  NiveauRisque: {
    FAIBLE: 'FAIBLE',
    MOYEN: 'MOYEN',
    ELEVE: 'ELEVE',
    CRITIQUE: 'CRITIQUE'
  },
  TypeCompte: {
    COURANT: 'COURANT',
    EPARGNE: 'EPARGNE',
    PROFESSIONNEL: 'PROFESSIONNEL',
    MARCHAND: 'MARCHAND'
  }
};
`,

  'User.ts': `const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client','technicien','analystefinanciere','admin'], default: 'client' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
UserSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function(candidate){
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
`,

  'Compte.ts': `const mongoose = require('mongoose');
const { TypeCompte } = require('./enums');

const CompteSchema = new mongoose.Schema({
  nameAccount: { type: String, required: true },
  numeroCompte: { type: String, required: true, unique: true },
  soldeActuel: { type: Number, default: 0 },
  typeCompte: { type: String, enum: Object.values(TypeCompte), default: TypeCompte.COURANT },
  dateCreation: { type: Date, default: Date.now },
  devise: { type: String, default: 'EUR' },
  limiteDailyTransfer: { type: Number, default: 0 },
  totalTransferToday: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed }
});

// helper method: apply a transaction to the account (update balance)
CompteSchema.methods.applyTransaction = function(amount){
  this.soldeActuel += amount;
  return this.save();
};

module.exports = mongoose.model('Compte', CompteSchema);
`,

  'Transaction.ts': `const mongoose = require('mongoose');
const { TypeTransaction, StatutTransaction } = require('./enums');

const TransactionSchema = new mongoose.Schema({
  idTransaction: { type: Number }, // optional external id
  step: { type: Number, default: 0 }, // snapshot step for dataset alignment
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // owner
  compteSource: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte' },
  compteDestination: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte' },
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  type: { type: String, enum: Object.values(TypeTransaction), default: TypeTransaction.OTHER },
  channel: { type: String, enum: ['online','branch','atm','pos','mobile'], default: 'online' },
  statut: { type: String, enum: Object.values(StatutTransaction), default: StatutTransaction.EN_ATTENTE },
  isFraud: { type: Boolean, default: false },
  riskScore: { type: Number, default: 0 },
  mlDetails: { type: mongoose.Schema.Types.Mixed }, // store ML output & features
  description: { type: String },
  balanceAfterSource: { type: Number },
  balanceAfterDestination: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// helpers
TransactionSchema.methods.markAsFraud = function(score, details){
  this.isFraud = true;
  this.riskScore = score || this.riskScore;
  if(details) this.mlDetails = Object.assign(this.mlDetails || {}, details);
  return this.save();
};

module.exports = mongoose.model('Transaction', TransactionSchema);
`,

  'Anomalie.ts': `const mongoose = require('mongoose');

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

module.exports = mongoose.model('Anomalie', AnomalieSchema);
`,

  'Alert.ts': `const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // owner of tx
  niveau: { type: String, enum: ['low','medium','critical'], default: 'low' },
  status: { type: String, enum: ['open','validated','rejected','closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Alert', AlertSchema);
`,

  'SnapshotSolde.ts': `const mongoose = require('mongoose');

const SnapshotSoldeSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  idSnapshot: { type: Number },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Compte' },
  oldBalance: { type: Number },
  newBalance: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

SnapshotSoldeSchema.statics.capture = async function(transaction, accountBefore, accountAfter){
  return this.create({
    transaction: transaction._id,
    account: accountBefore._id,
    oldBalance: accountBefore.soldeActuel,
    newBalance: accountAfter.soldeActuel,
    timestamp: new Date()
  });
};

module.exports = mongoose.model('SnapshotSolde', SnapshotSoldeSchema);
`,

  'Notification.ts': `const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sujet: { type: String },
  message: { type: String },
  niveau: { type: String, enum: ['info','warning','critical'], default: 'info' },
  lu: { type: Boolean, default: false },
  meta: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.methods.markRead = function(){
  this.lu = true;
  return this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);
`,

  'Rapport.ts': `const mongoose = require('mongoose');

const RapportSchema = new mongoose.Schema({
  titre: { type: String },
  dateGeneration: { type: Date, default: Date.now },
  contenu: { type: String }, // base64, path or text
  periode: { type: String }, // e.g. '2025-01'
  meta: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('Rapport', RapportSchema);
`
};

for (const [name, content] of Object.entries(files)) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log('Created', filePath);
}

console.log('\\nDone. Models generated in:', outDir);
console.log('Review and adapt the schemas to your business rules and add indexes/validation as needed.');