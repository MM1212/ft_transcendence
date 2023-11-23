import useFriend from '@apps/Friends/hooks/useFriend';
import AvatarWithStatus from '@components/AvatarWithStatus';
import { useUser } from '@hooks/user';
import { Divider, Sheet, Stack, Table, Typography } from '@mui/joy';
import { userStatusToString } from '@utils/userStatus';
import LeaderBoardUser from '../components/LeaderBoardUser';
import { fourth } from '../styles';
import { randomInt } from '@utils/random';

export default function LeaderBoard() {
  const id = 4;
  const user = useUser(id);
  if (!user) return null;
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
          margin: '20px 0',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 2fr 1fr',
          rowGap: '15px',
          alignItems: 'center',
        }}
      >
        <Typography
          level="title-md"
          fontWeight={600}
          style={{
            gridColumnStart: '1',
          }}
        >
          Position
        </Typography>
        <Typography
          level="title-md"
          fontWeight={600}
          style={{
            gridColumnStart: 2,
          }}
        >
          Name
        </Typography>
        <Typography style={fourth} level="title-md" fontWeight={600}>
          Points
        </Typography>
        {[...new Array(10)].map((_, i) => (
          <LeaderBoardUser key={i} position={i + 1} name={user.nickname} points={randomInt(50, 500) * (Math.pow(10, 10 - i))} />
        ))}
      </div>
    </Sheet>
  );
}
