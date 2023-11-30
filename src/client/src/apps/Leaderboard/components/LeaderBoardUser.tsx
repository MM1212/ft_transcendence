import useFriend from '@apps/Friends/hooks/useFriend';
import { useUser } from '@hooks/user';
import { Box, Chip, Divider, Tooltip, Typography, colors } from '@mui/joy';
import { fourth } from '../styles';
import { UserAvatar } from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users';
import MedalIcon from '@components/icons/MedalIcon';

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
      {position < 4 ? (
        <MedalIcon
          sx={{
            fontSize: '2.5rem',
            color:
              position === 3
                ? '#cd7f32'
                : position === 2
                  ? '#b0bec5'
                  : position === 1
                    ? '#fbc02d'
                    : undefined,
          }}
        />
      ) : (
        <Typography
          level="h3"
          sx={{
            gridColumnStart: '1',
            py: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* {formatToOrdinal(position)} */}
          <small>#</small>{position}
        </Typography>
      )}
      <Box
        sx={{
          gridColumnStart: '3',
          justifySelf: 'left',
          padding: '1 0 1 0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
          maxWidth: '25dvh'
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
        <Typography level="title-md" noWrap={true}>
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
          gridColumnEnd: 'span 5',
        }}
      />
    </>
  );
}
