import mongoose from 'mongoose';

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
