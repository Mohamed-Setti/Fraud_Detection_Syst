import mongoose from 'mongoose';

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
