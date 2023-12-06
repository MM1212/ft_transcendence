import { UserAvatar } from '@components/AvatarWithStatus';
import AccountArrowDownIcon from '@components/icons/AccountArrowDownIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import RobotIcon from '@components/icons/RobotIcon';
import SwapHorizontalBoldIcon from '@components/icons/SwapHorizontalBoldIcon';
import { useUser } from '@hooks/user';
import tunnel from '@lib/tunnel';
import { Badge, Box, Divider, IconButton, Tooltip } from '@mui/joy';
import { Typography } from '@mui/joy';
import { Stack } from '@mui/joy';
import PongModel from '@typings/models/pong';
import { useRecoilCallback } from 'recoil';
import pongGamesState from '../state';
import AlertIcon from '@components/icons/AlertIcon';
import InformationVariantCircleIcon from '@components/icons/InformationVariantCircleIcon';

export default function LobbyPlayerPlaceholder({
  id,
  teamId,
  teamPosition,
  warnForPositionShift = false,
}: {
  id: number | undefined;
  teamId: PongModel.Models.TeamSide;
  teamPosition: number | undefined;
  warnForPositionShift?: boolean;
}) {
  const user = useUser(id!);

  const handleChangeTeam = useRecoilCallback(
    (ctx) => async () => {
      try {
        const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (lobby === null || teamPosition === undefined) return;
        await tunnel.post(PongModel.Endpoints.Targets.ChangeTeam, {
          teamId,
          teamPosition,
          lobbyId: lobby.id,
        });
        console.log('change team success');
      } catch (err) {
        console.log(err);
      }
    },
    [teamId, teamPosition]
  );

  const handleChangeOwner = useRecoilCallback(
    (ctx) => async () => {
      try {
        const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (lobby === null) return;
        await tunnel.post(PongModel.Endpoints.Targets.ChangeOwner, {
          lobbyId: lobby.id,
          ownerToBe: id!,
        });
        console.log('change owner success');
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  return (
    <>
      <Divider />
      <Stack display="flex" flexDirection="row" sx={{ pt: 2, pb: 2 }}>
        <Badge
          badgeInset="14%"
          color="warning"
          variant="solid"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          badgeContent={
            <Tooltip title="You'll be moved to the top position when the game starts">
              <InformationVariantCircleIcon size="sm" fontSize="sm" />
            </Tooltip>
          }
          invisible={!warnForPositionShift}
        >
          <UserAvatar
            color="warning"
            variant="soft"
            src={user?.avatar}
            sx={{ width: 50, height: 50 }}
          />
        </Badge>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          sx={{ pl: '20px' }}
        >
          <Typography color={user?.id  ? 'danger' : 'neutral'} level="body-lg">{user?.nickname}</Typography>
          <Typography level="body-sm">Rank Placeholder</Typography>
        </Box>
        {!id ? (
          <>
            <IconButton
              color="warning"
              variant="plain"
              size="lg"
              sx={{
                marginLeft: 'auto',
                borderRadius: 'xl',
              }}
              onClick={handleChangeTeam}
            >
              <SwapHorizontalBoldIcon />
            </IconButton>
            <IconButton
              color="warning"
              variant="plain"
              size="lg"
              sx={{
                borderRadius: 'xl',
              }}
            >
              <RobotIcon />
            </IconButton>
          </>
        ) : (
          <IconButton
            color="warning"
            variant="plain"
            size="lg"
            sx={{
              borderRadius: 'xl',
            }}
            onClick={handleChangeOwner}
          >
            <RobotIcon />
          </IconButton>
        )}
      </Stack>
      <Divider />
    </>
  );
}
