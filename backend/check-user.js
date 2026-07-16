const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany();
    console.log('All Users in DB:');
    users.forEach(u => {
      console.log(`- ID: ${u.id}, Name: ${u.fullName}, Email: "${u.email}", HasPassword: ${!!u.password}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
