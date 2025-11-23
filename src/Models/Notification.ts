import mongoose from 'mongoose';

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

const Notification = mongoose.model('Notification', NotificationSchema);

export default mongoose.models.Notification || Notification;