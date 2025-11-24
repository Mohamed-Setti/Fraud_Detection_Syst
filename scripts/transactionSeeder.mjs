import { faker } from '@faker-js/faker';

/**
 * seedTransactions(count, TransactionModel, users)
 * - count: number of transactions to create
 * - TransactionModel: the Mongoose model
 * - users: array of user objects (created earlier), each must have _id
 *
 * Returns array of created transactions (lean).
 */
export async function seedTransactions(count = 200, TransactionModel, users = []) {
  if (!TransactionModel) throw new Error('TransactionModel is required');
  if (!Array.isArray(users) || users.length === 0) {
    console.warn('No users provided to transactions seeder — transactions will have null user references.');
  }

  const typeValues = ['OTHER', 'TRANSFER', 'PAYMENT', 'WITHDRAWAL', 'DEPOSIT'];
  const statutValues = ['EN_ATTENTE', 'VALIDE', 'REJETE'];
  const channelValues = ['online', 'branch', 'atm', 'pos', 'mobile'];

  const docs = [];
  const baseId = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const amount = parseFloat(faker.finance.amount(1, 20000, 2));
    const user = users.length ? faker.helpers.arrayElement(users) : null;
    const type = faker.helpers.arrayElement(typeValues);
    const channel = faker.helpers.arrayElement(channelValues);
    const statut = faker.helpers.arrayElement(statutValues);
    const isFraud = faker.datatype.boolean(0.02); // ~2% fraud
    const riskScore = isFraud ? faker.number.int({ min: 60, max: 100 }) : faker.number.int({ min: 0, max: 60 });
    const compteSource = faker.finance.account(12);
    const compteDestination = faker.finance.account(12);
    const balanceAfterSource = parseFloat(faker.finance.amount(0, 100000, 2));
    const balanceAfterDestination = type === 'DEPOSIT'
      ? balanceAfterSource + amount
      : parseFloat(faker.finance.amount(0, 100000, 2));

    docs.push({
      idTransaction: baseId + i,
      step: faker.number.int({ min: 0, max: 5 }),
      user: user ? user._id : null,
      compteSource,
      compteDestination,
      date: faker.date.recent({ days: 365 }),
      amount,
      type,
      channel,
      statut,
      isFraud,
      riskScore,
      mlDetails: {
        modelVersion: `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 20 })}`,
        features: {
          unusualLocation: faker.datatype.boolean(),
          largeAmount: amount > 10000,
          rapidFrequency: faker.datatype.boolean()
        }
      },
      description: faker.finance.transactionDescription() || faker.lorem.sentence(),
      balanceAfterSource,
      balanceAfterDestination,
      createdAt: faker.date.recent({ days: 365 })
    });
  }

  const created = await TransactionModel.insertMany(docs, { ordered: false });
  return created.map(doc => doc.toObject());
}