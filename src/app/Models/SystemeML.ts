export interface TransactionDataML {
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
