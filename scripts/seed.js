import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import User from "../src/Models/User.js"; // OBLIGATOIRE: importer avec .js

async function main() {
  try {
    await mongoose.connect(
      "mongodb+srv://ProjetNextJs:P12QKE5OtxQR8SupXZQ9C@fdsdb.dffagbq.mongodb.net/FDS"
    );
    console.log("✅ Connecté à MongoDB");

    const roles = ["CLIENT", "ANALYSTE", "ADMIN"];
    const docs = [];

    for (let i = 0; i < 50; i++) {
      const first = faker.person.firstName();
      const last = faker.person.lastName();

      const email =
        `${first}.${last}.${faker.number.int(99999)}@example.com`.toLowerCase();

      const passwordHash = await bcrypt.hash("password123", 10);

      docs.push({
        name: `${first} ${last}`,
        email,
        mobile: faker.phone.number("+2126########"),
        passwordHash,
        role: faker.helpers.arrayElement(roles),
        isAuthenticated: faker.datatype.boolean(),
      });
    }

    await User.insertMany(docs);

    console.log("🎉 50 utilisateurs créés !");
    await mongoose.disconnect();
    console.log("🔌 Déconnecté");
  } catch (err) {
    console.error("❌ Erreur :", err);
  }
}

main();
