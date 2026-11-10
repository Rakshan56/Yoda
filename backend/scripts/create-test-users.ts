import "dotenv/config";
import { readFile } from "node:fs/promises";
import argon2 from "argon2";
import { PrismaClient, UserRole } from "@prisma/client";

type TestUser = {
  id: string;
  email: string;
  password: string;
  display_name: string;
  role: keyof typeof UserRole;
  purpose: string;
};

const templatePath = new URL("../data/test-users.template.json", import.meta.url);
const prisma = new PrismaClient();

async function main() {
  const users = JSON.parse(await readFile(templatePath, "utf8")) as TestUser[];
  for (const user of users) {
    if (!user.email.endsWith("@example.test")) {
      throw new Error(`Refusing to seed non-test email: ${user.email}`);
    }
    if (user.password.length < 12) {
      throw new Error(`Test password for ${user.id} must be at least 12 characters.`);
    }

    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: await argon2.hash(user.password, { type: argon2.argon2id }),
        displayName: user.display_name,
        role: UserRole[user.role],
        isActive: true
      },
      create: {
        email: user.email,
        passwordHash: await argon2.hash(user.password, { type: argon2.argon2id }),
        displayName: user.display_name,
        role: UserRole[user.role],
        isActive: true
      }
    });
    console.log(`${user.id}: ${record.id} — ${user.email} (${user.role}) — ${user.purpose}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
