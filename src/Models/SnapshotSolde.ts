import mongoose from 'mongoose';

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

const SnapshotSolde = mongoose.model('SnapshotSolde', SnapshotSoldeSchema);
export default mongoose.models.SnapshotSolde || SnapshotSolde;