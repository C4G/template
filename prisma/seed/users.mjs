import { createId } from '@paralleldrive/cuid2';

const USERS = [
  {
    email: 'c4gdevad@gmail.com',
    userName: 'C4G Admin',
    role: 'ADMIN',
    providerAccountId: '102858545601971723113',
  },
  {
    email: 'c4gdevstaff@gmail.com',
    userName: 'C4G Staff',
    role: 'STAFF',
    providerAccountId: '116868783453066553710',
  },
];

const seedUser = async (
  prisma,
  { email, providerAccountId, role, userName }
) => {
  const hasUser = await prisma.user.findUnique({
    where: { email },
  });
  if (hasUser) {
    console.warn(`${email} already exists and will not be seeded!`);
    return;
  }
  await prisma.user.create({
    data: {
      id: createId(),
      name: userName,
      email,
      emailVerified: true,
      role,
      accounts: {
        create: {
          id: createId(),
          providerId: 'google',
          accountId: providerAccountId,
          scope:
            'https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile',
        },
      },
    },
  });
  console.log(`${email} has been seeded`);
};

export const seedUsers = async (prisma) => {
  for (const user of USERS) {
    await seedUser(prisma, user);
  }
};
