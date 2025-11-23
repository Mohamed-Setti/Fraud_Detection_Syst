import mongoose from 'mongoose';

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

const Alert = mongoose.model('Alert', AlertSchema);

export default mongoose.models.Alert || Alert;