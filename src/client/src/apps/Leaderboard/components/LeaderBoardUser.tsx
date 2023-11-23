import useFriend from '@apps/Friends/hooks/useFriend';
import { useUser } from '@hooks/user';
import { Box, Divider, Tooltip, Typography } from '@mui/joy';
import { fourth } from '../styles';
import { UserAvatar } from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users';

const ordinals = new Intl.PluralRules('en', { type: 'ordinal' });

const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

const formatToOrdinal = (n: number): string => {
  const category = ordinals.select(n);
  const suffix = suffixes[category as keyof typeof suffixes];
  return `${n}${suffix}`;
};

export default function LeaderBoardUser({
  user,
  points,
  position,
}: {
  position: number;
  user: UsersModel.Models.IUserInfo;
  points: number;
}) {
  const { goToProfile } = useFriend(user.id);
  return (
    <>
      <Typography
        level="h3"
        sx={{
          gridColumnStart: '1',
          py: 1,
        }}
      >
        {formatToOrdinal(position)}
      </Typography>
      <Box
        sx={{
          gridColumnStart: '2',
          padding: '1 0 1 0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Tooltip title="Profile">
          <UserAvatar
            src={user.avatar}
            size="sm"
            onClick={goToProfile}
            sx={{
              '&:hover': {
                cursor: 'pointer',
              },
            }}
          />
        </Tooltip>
        <Typography level="title-md" sx={{}}>
          {user.nickname}
        </Typography>
      </Box>
      <Typography
        style={fourth}
        sx={{
          py: 1,
        }}
      >
        {points}
      </Typography>
      {/* // </Stack> */}
      <Divider
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 'span 4',
        }}
      />
    </>
  );
}
