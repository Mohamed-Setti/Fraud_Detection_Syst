// Common enums used by models
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
  ONLINE: 'ONLINE',
  BRANCH: 'BRANCH',
  ATM: 'ATM',
  POS: 'POS',
  MOBILE: 'MOBILE'
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
  CLIENT: 'CLIENT',
  TECHNICIEN: 'TECHNICIEN',
  ANALYSTE_FINANCIERE: 'ANALYSTE_FINANCIERE',
  ADMIN: 'ADMIN'
} as const;

