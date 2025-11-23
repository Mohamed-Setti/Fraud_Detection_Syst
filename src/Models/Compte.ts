import mongoose from 'mongoose';

enum TypeCompte {
    COURANT = 'COURANT',
    EPARGNE = 'EPARGNE',
    PROFESSIONNEL = 'PROFESSIONNEL',
    MARCHAND = 'MARCHAND'
  }

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
// CompteSchema.methods.applyTransaction = function(amount){
//   this.soldeActuel += amount;
//   return this.save();
// };

const Compte  = mongoose.model('Compte', CompteSchema);

export default mongoose.models.Compte || Compte;