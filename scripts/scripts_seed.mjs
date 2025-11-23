import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import minimist from 'minimist';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Usage:
 *   node scripts/seed.mjs --drop --users=50 --transactions=200
 *
 * Defaults:
 *   users = 50
 *   transactions = 200
 *
 * This script dynamically imports your models from ./models/User.js and ./models/Transaction.js
 * and calls the seeders in scripts/seeders/.
 */

const argv = minimist(process.argv.slice(2));
const DROP = argv.drop || false;
const USERS_COUNT = parseInt(argv.users || argv.u || 50, 10);
const TRANSACTIONS_COUNT = parseInt(argv.transactions || argv.t || 200, 10);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env. Please set MONGO_URI and re-run.');
  process.exit(1);
}

async function importModel(relPath) {
  const absolute = path.resolve(process.cwd(), relPath);
  const url = `file://${absolute}`;
  const mod = await import(url);
  return mod.default || mod;
}

async function importSeeder(relPath) {
  const absolute = path.resolve(process.cwd(), relPath);
  const url = `file://${absolute}`;
  const mod = await import(url);
  return mod;
}

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, {});

  if (DROP) {
    console.log('Dropping database:', mongoose.connection.db.databaseName);
    await mongoose.connection.dropDatabase();
    console.log('Database dropped.');
  }

  // Import models
  let UserModel, TransactionModel;
  try {
    UserModel = await importModel('./models/User.js');
    TransactionModel = await importModel('./models/Transaction.js');
  } catch (err) {
    console.error('Error importing models. Make sure models/User.js and models/Transaction.js exist.');
    console.error(err);
    process.exit(1);
  }

  // Import seeders
  const userSeederMod = await importSeeder('./scripts/seeders/userSeeder.mjs');
  const txSeederMod = await importSeeder('./scripts/seeders/transactionSeeder.mjs');

  const userSeeder = userSeederMod.seedUsers;
  const txSeeder = txSeederMod.seedTransactions;

  if (typeof userSeeder !== 'function' || typeof txSeeder !== 'function') {
    console.error('Seeders must export seedUsers and seedTransactions functions.');
    process.exit(1);
  }

  console.log(`Seeding ${USERS_COUNT} users...`);
  const users = await userSeeder(USERS_COUNT, UserModel);
  console.log(`Created ${users.length} users.`);

  console.log(`Seeding ${TRANSACTIONS_COUNT} transactions referencing users...`);
  const transactions = await txSeeder(TRANSACTIONS_COUNT, TransactionModel, users);
  console.log(`Created ${transactions.length} transactions.`);

  await mongoose.disconnect();
  console.log('Done. Disconnected mongoose.');
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});