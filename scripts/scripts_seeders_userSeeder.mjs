import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

/**
 * seedUsers(count, UserModel)
 * - count: number of users to create
 * - UserModel: the Mongoose model (passed from seed.mjs)
 *
 * Returns array of created documents (lean).
 */
export async function seedUsers(count = 50, UserModel) {
  if (!UserModel) throw new Error('UserModel is required');

  const roles = ['CLIENT', 'TECHNICIEN', 'ANALYSTE', 'ADMIN', 'analystefinanciere'];
  const docs = [];
  for (let i = 0; i < count; i++) {
    const first = faker.person.firstName();
    const last = faker.person.lastName();
    const uniqueSuffix = `${Date.now().toString().slice(-6)}${i}`;
    const email = `${first}.${last}.${uniqueSuffix}@${faker.internet.domainName()}`.toLowerCase();
    const mobile = faker.phone.number('+2126########'); // Moroccan-ish example, adjust as needed
    const plainPassword = faker.internet.password(10);
    // Hash password synchronously to keep code simple (bcryptjs available)
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    docs.push({
      name: `${first} ${last}`,
      email,
      mobile,
      passwordHash,
      role: faker.helpers.arrayElement(roles),
      isAuthenticated: faker.datatype.boolean(),
      createdAt: faker.date.past({ years: 2 })
    });
  }

  // insertMany returns documents created
  const created = await UserModel.insertMany(docs, { ordered: false });
  // Return plain JS objects
  return created.map(doc => doc.toObject());
}