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
  // create a match history for the first user
  const match = await prisma.matchHistory.create({
    data: {
      winnerTeamId: 0,
      name: 'Test seeded',
      teams: {
        createMany: {
          data: [
            {
              score: 10,
              won: true,
              stats: {},
            },
            {
              score: 5,
              won: false,
              stats: {},
            },
          ],
        },
      },
    },
    include: {
      teams: {
        include: {
          players: true,
        },
      },
    },
  });
  await prisma.matchHistoryPlayer.createMany({
    data: [
      {
        userId: 1,
        teamId: match.teams[0].id,
        gear: { paddle: 'test.webp', specialPower: 'fire' },
        mvp: true,
        owner: true,
        score: 5,
        stats: {},
      },
      {
        userId: 2,
        teamId: match.teams[1].id,
        gear: { paddle: 'test.webp', specialPower: 'ghost' },
        mvp: false,
        owner: false,
        score: 2,
        stats: {},
      },
      {
        userId: 3,
        teamId: match.teams[0].id,
        gear: { paddle: 'test.webp', specialPower: 'fire' },
        mvp: false,
        owner: false,
        score: 5,
        stats: {},
      },
      {
        userId: 4,
        teamId: match.teams[1].id,
        gear: { paddle: 'test.webp', specialPower: 'ghost' },
        mvp: false,
        owner: false,
        score: 3,
        stats: {},
      },
    ],
  });
  // const [p1,p2,p3,p4] = await prisma.matchHistoryPlayer.findMany({
  //   take: 4,
  //   orderBy: {
  //     id: 'desc',
  //   },
  // });
  // match.teams[0].players = [p1, p3];
  // match.teams[1].players = [p2, p4];
  // await Promise.all(
  //   match.teams.map(async (team, i) => {
  //     await prisma.matchHistoryTeam.update({
  //       data: {
  //         players: {
  //           connect: team.players.map((p) => ({ id: p.id })),
  //         },
  //       },
  //       where: {
  //         id: team.id,
  //       },
  //     });
  //   }),
  // );
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
