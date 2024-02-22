import { UserAvatar } from '@components/AvatarWithStatus';
import ProfileTooltip from '@components/ProfileTooltip';
import CrownIcon from '@components/icons/CrownIcon';
import { useUser } from '@hooks/user';
import {
  Stack,
  Typography,
  AvatarGroup,
  Sheet,
  Avatar,
  Badge,
} from '@mui/joy';
import PongHistoryModel from '@typings/models/pong/history';
import moment from 'moment';
import React from 'react';

function PlayerAvatarRenderer({
  mvp,
  userId,
  side,
}: Pick<PongHistoryModel.Models.Player, 'mvp' | 'userId'> & {
  side: 'left' | 'right';
}) {
  const user = useUser(userId);
  if (!user) return <Avatar size="sm" />;
  return (
    <ProfileTooltip user={user}>
      <Badge
        anchorOrigin={{
          horizontal: side,
          vertical: 'bottom',
        }}
        invisible={!mvp}
        badgeContent={<CrownIcon size="xxs" />}
        color="warning"
        variant="soft"
        size="sm"
      >
        <UserAvatar src={user.avatar} />
      </Badge>
    </ProfileTooltip>
  );
}

function TeamRenderer({
  side,
  size = 3,
  ...team
}: PongHistoryModel.Models.Team & {
  side: 'left' | 'right';
  size?: number;
}) {
  return (
    <AvatarGroup
      sx={{
        '--Avatar-size': (theme) => theme.spacing(size),
        transform: side === 'left' ? 'scaleX(-1)' : undefined,
      }}
    >
      {team.players.map((player) => (
        <PlayerAvatarRenderer
          key={player.userId}
          userId={player.userId}
          mvp={player.mvp}
          side={side}
        />
      ))}
    </AvatarGroup>
  );
}

export default function MatchHistoryEntryHeader({
  targetId,
  size,
  ...match
}: PongHistoryModel.Models.Match & {
  targetId: number;
  size?: number;
}) {
  const [myTeam, otherTeam, inTeam] = React.useMemo<
    [PongHistoryModel.Models.Team, PongHistoryModel.Models.Team, boolean]
  >(() => {
    const myTeam = match.teams.find((team) =>
      team.players.some((player) => player.userId === targetId)
    );
    if (myTeam === match.teams[0])
      return [...match.teams, true] as [
        PongHistoryModel.Models.Team,
        PongHistoryModel.Models.Team,
        boolean
      ];
    return [myTeam ?? match.teams[1], match.teams[0], false];
  }, [match.teams, targetId]);
  
  return (
    <Stack
      direction={'row'}
      width={'100%'}
      justifyContent="space-between"
      alignItems={'center'}
      position="relative"
    >
      {inTeam ? (
        myTeam.won ? (
          <Typography
            level="h4"
            textTransform="uppercase"
            ml={0}
            textColor={'primary.200'}
          >
            Victory
          </Typography>
        ) : (
          <Typography
            level="h4"
            textTransform="uppercase"
            ml={0}
            textColor={'danger.400'}
          >
            Defeat
          </Typography>
        )
      ) : (
        <Typography
            level="h4"
            textTransform="uppercase"
            ml={0}
            color="neutral"
          >
            Game #{match.id}
          </Typography>
      )}
      <Stack
        direction="row"
        justifyContent="space-around"
        spacing={2}
        alignItems="center"
        position="absolute"
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <TeamRenderer side="left" {...myTeam} size={size} />
        <Sheet
          sx={{
            p: 1,
            borderRadius: (theme) => theme.radius.md,
          }}
        >
          <Typography level="h3">
            {myTeam.score} - {otherTeam.score}
          </Typography>
        </Sheet>
        <TeamRenderer side="right" {...otherTeam} size={size} />
      </Stack>
      <Stack direction="column" spacing={0.2} alignItems="flex-end">
        <Typography level="body-xs">
          {moment(match.createdAt).format('DD/MM/YYYY')}
        </Typography>
        <Typography level="body-xs">
          {moment.utc(match.stats.gameDuration as number).format('HH:mm:ss')}
        </Typography>
      </Stack>
    </Stack>
  );
}
