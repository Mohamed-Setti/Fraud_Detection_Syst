import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import User from "../src/Models/User.js";
import Transaction from "../src/Models/Transaction.js";

async function seedTransactions() {
  try {
    // 1️⃣ Connexion à MongoDB
    await mongoose.connect(
      "mongodb+srv://ProjetNextJs:P12QKE5OtxQR8SupXZQ9C@fdsdb.dffagbq.mongodb.net/FDS"
    );
    console.log("✅ Connecté à MongoDB");

    // 2️⃣ Récupérer tous les utilisateurs
    const users = await User.find({});
    if (users.length === 0) {
      console.log("❌ Aucun utilisateur trouvé ! Exécute d'abord seed.js");
      return;
    }

    const docs = [];

    // 3️⃣ Générer 20 transactions par utilisateur
    users.forEach(user => {
      for (let i = 0; i < 20; i++) {
        docs.push({
          user: user._id,
          amount: faker.number.float({ min: 5, max: 5000, precision: 0.01 }),
          type: faker.helpers.arrayElement(["PAYMENT", "REFUND", "TRANSFER", "WITHDRAWAL", "DEPOSIT"]),
          channel: faker.helpers.arrayElement(["online","branch","atm","pos","mobile"]),
          statut: faker.helpers.arrayElement(["EN_ATTENTE","VALIDE","REJETE"]),
          isFraud: faker.datatype.boolean(),
          riskScore: faker.number.int({ min: 0, max: 100 }),
          description: faker.lorem.sentence(),
          date: faker.date.recent({ days: 90 }),
          balanceAfterSource: faker.number.float({ min: 0, max: 10000 }),
          balanceAfterDestination: faker.number.float({ min: 0, max: 10000 }),
        });
      }
    });

    // 4️⃣ Inserer toutes les transactions
    await Transaction.insertMany(docs);
    console.log(`🎉 ${docs.length} transactions générées !`);

    // 5️⃣ Déconnexion
    await mongoose.disconnect();
    console.log("🔌 Déconnecté");
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

seedTransactions();
