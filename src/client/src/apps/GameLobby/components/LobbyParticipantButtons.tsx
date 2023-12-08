import { useCurrentUser, useUser } from '@hooks/user';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { Tooltip } from '@mui/joy';
import { IconButton } from '@mui/joy';
import CrownIcon from '@components/icons/CrownIcon';
import RobotIcon from '@components/icons/RobotIcon';
import SwapHorizontalBoldIcon from '@components/icons/SwapHorizontalBoldIcon';
import KarateIcon from '@components/icons/KarateIcon';

export function ChangeOwnerButton({
  id,
  ownerId,
}: {
  id: number;
  ownerId: number;
}) {
  const user = useCurrentUser();

  const handleChangeOwner = useRecoilCallback(
    (ctx) => async () => {
      try {
        const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (lobby === null) return;
        await tunnel.post(PongModel.Endpoints.Targets.ChangeOwner, {
          lobbyId: lobby.id,
          ownerToBe: id,
        });
        console.log('change owner success');
      } catch (err) {
        console.log(err);
      }
    },
    [id]
  );

  if (id === ownerId) return null;
  if (user?.id !== ownerId) return null;
  return (
    <Tooltip title="Change Game Master">
      <IconButton
        color="warning"
        variant="plain"
        sx={{
          borderRadius: 'xl',
        }}
        onClick={handleChangeOwner}
      >
        <CrownIcon />
      </IconButton>
    </Tooltip>
  );
}

export function AddBotButton() {
  return (
    <>
      <Tooltip title="Add Bot">
        <IconButton
          color="warning"
          variant="plain"
          sx={{
            borderRadius: 'xl',
          }}
        >
          <RobotIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

export function KickParticipantButton({
  id,
  ownerId,
}: {
  id: number;
  ownerId: number;
}) {

  const user = useCurrentUser();
  const handleKickParticipant = useRecoilCallback(
    (ctx) => async () => {
      try {
        const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (lobby === null) return;
        await tunnel.post(PongModel.Endpoints.Targets.Kick, {
          lobbyId: lobby.id,
          userId: id,
        });
        console.log('kick participant success');
      } catch (err) {
        console.log(err);
      }
    },
    [id]
  );

  if (id === ownerId) return null;
  if (user?.id !== ownerId) return null;
  return (
    <>
      <Tooltip title="Kick Player">
        <IconButton color={"danger"} sx={{ ml: 'auto' }} onClick={handleKickParticipant}>
          <KarateIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}

export function ChangeTeamButton({
  teamId,
  teamPosition,
}: {
  teamId: number;
  teamPosition: number | undefined;
}) {
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

  if (teamPosition === undefined) return null;
  return (
    <>
      <Tooltip title="Switch to position">
        <IconButton
          color="warning"
          variant="plain"
          sx={{
            borderRadius: 'xl',
          }}
          onClick={handleChangeTeam}
        >
          <SwapHorizontalBoldIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
