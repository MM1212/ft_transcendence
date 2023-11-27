import useFriend from '@apps/Friends/hooks/useFriend';
import AvatarWithStatus from '@components/AvatarWithStatus';
import { useUser } from '@hooks/user';
import { Divider, Sheet, Stack, Table, Typography } from '@mui/joy';
import { userStatusToString } from '@utils/userStatus';
import LeaderBoardUser from '../components/LeaderBoardUser';
import { fourth } from '../styles';
import { randomInt } from '@utils/random';

export default function LeaderBoard() {
  const users = [
    useUser(1),
    useUser(2),
    useUser(3),
    useUser(4),
  ];
  return (
    <Sheet
      sx={{
        height: '100dvh',
        width: '45dvh',
        p: 2,
      }}
    >
      <Typography level="h1">The Best.</Typography>
      <Divider />
      <div
        style={{
          margin: '24px 0',
          display: 'grid',
          gridTemplateColumns: '1fr 0.25fr 2fr 1.5fr 1fr',
          rowGap: '16px',
          alignItems: 'center',
          justifyItems: 'center'
        }}
      >
        <Typography
          level="title-md"
          fontWeight={600}
          style={{
            gridColumnStart: '1',
            justifySelf: 'left'
          }}
        >
          Position
        </Typography>
        <Typography
          level="title-md"
          fontWeight={600}
          style={{
            gridColumnStart: 3,
            justifySelf: 'left'
          }}
        >
          Name
        </Typography>
        <Typography style={fourth} level="title-md" fontWeight={600}>
          Points
        </Typography>
        {users.map((user, i) => (
          <LeaderBoardUser key={i} position={i + 1} user={user!} points={randomInt(5, 50) * (Math.pow(2, 10 - i))} />
        ))}
      </div>
    </Sheet>
  );
}
