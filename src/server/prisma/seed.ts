import { PrismaClient } from '@prisma/client';
import users from './users.json';

const prisma = new PrismaClient();
const AVATAR_IDS = [...new Array(43)].map((_, i) => i.toString());
const PENGUIN_COLORS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20,
];
async function main() {
  for await (const user of users) {
    try {
      const handle = await prisma.user.create({
        data: {
          ...user,
          avatar: AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)],
          character: {
            create: {
              clothes: {
                color:
                  PENGUIN_COLORS[
                    Math.floor(Math.random() * PENGUIN_COLORS.length)
                  ],
                face: -1,
                head: -1,
                body: -1,
                feet: -1,
                hand: -1,
                neck: -1,
              },
            },
          },
        },
      });
      console.log(`Created user ${handle.nickname}`);
    } catch (e) {
      console.warn(e);
    }
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
