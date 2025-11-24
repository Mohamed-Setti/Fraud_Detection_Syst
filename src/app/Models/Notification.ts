import mongoose from 'mongoose';

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
