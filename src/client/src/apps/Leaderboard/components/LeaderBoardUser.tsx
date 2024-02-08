import { Grid, Sheet, Stack, Tooltip } from '@mui/joy';
import AvatarWithStatus from '@components/AvatarWithStatus';
import MedalIcon from '@components/icons/MedalIcon';
import LobbyGameTypography from '@apps/GameLobby/components/LobbyGameTypography';
import ProfileTooltip from '@components/ProfileTooltip';
import type LeaderboardModel from '@typings/models/leaderboard';
import { useUser } from '@hooks/user';

export default function LeaderBoardUser({
  userId,
  wins,
  losses,
  ties,
  elo,
  streak,
  position,
}: LeaderboardModel.Models.Leaderboard & { position: number }) {
  const user = useUser(userId);
  if (!user) return null;

  const gamesPlayed = wins + losses + ties;
  const winRate = gamesPlayed ? Math.floor((wins / gamesPlayed) * 100) : 0;
  return (
    <Sheet
      component={Grid}
      container
      flexGrow={1}
      py={1}
      alignItems="center"
      borderRadius="md"
      variant="outlined"
    >
      <Grid xs={2} container alignItems="center" pl={2}>
        {position < 4 ? (
          <MedalIcon
            sx={{
              fontSize: '1.8rem',
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
          <LobbyGameTypography
            level="h3"
            sx={{
              pl: 1.5,
              display: 'grid',
              gridTemplateColumns: 'subgrid',
              gridColumnStart: '1',
              py: 1,
              alignItems: 'center',
              border: 'unset',
            }}
          >
            {position}
          </LobbyGameTypography>
        )}
      </Grid>
      <Grid xs={5}>
        <Stack
          spacing={2}
          direction="row"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <ProfileTooltip user={user} placement="left-start">
            <AvatarWithStatus
              src={user.avatar}
              status={user.status}
              size="md"
            />
          </ProfileTooltip>
          <LobbyGameTypography level="body-md">
            {user.nickname}
          </LobbyGameTypography>
        </Stack>
      </Grid>
      <Grid xs={2}>
        <LobbyGameTypography level="body-md">{elo}</LobbyGameTypography>
      </Grid>
      <Grid xs={3} container justifyContent="flex-end" pr={2}>
        <Tooltip
          title={`${gamesPlayed} Games Played. ${wins} Wins, ${losses} Losses and ${ties} Ties with a current ${Math.abs(
            streak
          )} ${streak > 0 ? 'Win' : 'Loss'} Streak.`}
          size="md"
        >
          <LobbyGameTypography
            style={{
              justifySelf: 'right',
            }}
            level="body-md"
          >
            {winRate}%
          </LobbyGameTypography>
        </Tooltip>
      </Grid>
    </Sheet>
  );
}
