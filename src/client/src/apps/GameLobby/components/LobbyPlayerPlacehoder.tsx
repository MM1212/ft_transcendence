import { UserAvatar } from '@components/AvatarWithStatus';
import { useCurrentUser, useUser } from '@hooks/user';
import { Badge, Box, Chip, Divider, IconButton, Tooltip } from '@mui/joy';
import { Stack } from '@mui/joy';
import PongModel from '@typings/models/pong';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import CrownIcon from '@components/icons/CrownIcon';
import LobbyGameTypography from './LobbyGameTypography';
import {
  ChangeOwnerButton,
  AddBotButton,
  ChangeTeamButton,
  KickParticipantButton,
} from './LobbyParticipantButtons';
import CheckIcon from '@components/icons/CheckIcon';
import CogOutlineIcon from '@components/icons/CogOutlineIcon';
import { Modal } from '@mui/joy';
import { ModalDialog } from '@mui/joy';
import React from 'react';
import LobbyPongButton from './LobbyPongBottom';
import { ArrowSelector } from '@components/ArrowSelector/ArrowSelector';
import tunnel from '@lib/tunnel';
import {
  paddleConfig,
  specialPConfig,
} from '@components/ArrowSelector/ItemConfigs';
import notifications from '@lib/notifications/hooks';
import TrophyAwardIcon from '@components/icons/TrophyAwardIcon';
import ContentSaveIcon from '@components/icons/ContentSaveIcon';

function EditSettingsModal({
  handleCloseModalSendOptions,
  open,
  setCurrPower,
  setCurrPaddle,
  currPaddle,
  currPower,
}: {
  handleCloseModalSendOptions: () => Promise<void>;
  open: boolean;
  setCurrPower: (power: string) => void;
  setCurrPaddle: (paddle: string) => void;
  currPower: string;
  currPaddle: string;
}): JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const loadAndRun = (cb: () => Promise<void>) => async () => {
    setLoading(true);
    await cb();
    setLoading(false);
  };
  return (
    <Modal open={open} onClose={loadAndRun(handleCloseModalSendOptions)}>
      <ModalDialog>
        <Box
          gap={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LobbyGameTypography level="body-lg">
            Pick Your Poison
          </LobbyGameTypography>
          <ArrowSelector
            selectType="special_power"
            onClick={setCurrPower}
            selected={currPower}
          />
          <ArrowSelector
            selectType="paddle"
            onClick={setCurrPaddle}
            selected={currPaddle}
          />
          <LobbyPongButton
            sx={{
              position: 'relative',
              m: 'auto!important',
            }}
            startDecorator={<ContentSaveIcon />}
            label="Save"
            loading={loading}
            onClick={loadAndRun(handleCloseModalSendOptions)}
          />
        </Box>
      </ModalDialog>
    </Modal>
  );
}

export default function LobbyPlayerPlaceholder({
  id,
  teamId,
  teamPosition,
  ready,
  isMe,
  player,
}: {
  id: number | undefined;
  teamId: PongModel.Models.TeamSide;
  teamPosition: number | undefined;
  ready: boolean | undefined;
  isMe: boolean;
  player?: PongModel.Models.ILobbyParticipant;
}) {
  const user = useUser(id!);

  const currentUserId = useCurrentUser()?.id;

  const [openedModal, setOpenModal] = React.useState<boolean>(false);
  const lobbyOwner = useRecoilValue(pongGamesState.lobbyOwner);

  const lobby = useRecoilValue(pongGamesState.gameLobby)!;

  const [currPower, setCurrPower] = React.useState<string | null>(
    player?.specialPower || null
  );
  const [currPaddle, setCurrPaddle] = React.useState<string | null>(
    player?.paddle || null
  );

  const handleCloseModalSendOptions = useRecoilCallback((ctx) => async () => {
    if (!currPower || !currPaddle) {
      setOpenModal(false);
      return;
    }
    try {
      const updatedLobby = await tunnel.post(
        PongModel.Endpoints.Targets.UpdatePersonal,
        {
          lobbyId: lobby.id,
          paddleSkin: currPaddle,
          specialPower: currPower,
        }
      );
      ctx.set(pongGamesState.gameLobby, updatedLobby);
      notifications.success('Personal settings updated');
      setOpenModal(false);
    } catch (error) {
      console.error(error);
      notifications.error(
        'Failed to update personal settings',
        (error as Error).message
      );
    } finally {
      setOpenModal(false);
    }
  });

  React.useEffect(() => {
    setCurrPower(player?.specialPower || null);
    setCurrPaddle(player?.paddle || null);
  }, [player?.specialPower, player?.paddle]);

  if (lobbyOwner === null) return null;
  return (
    <>
      <Divider />
      <Stack
        display="flex"
        flexDirection="row"
        alignItems="center"
        sx={{ py: 2 }}
      >
        <Badge
          color={ready ? 'success' : 'warning'}
          variant={'outlined'}
          badgeInset="14%"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            badge: {
              sx: {
                py: 0.5,
              },
            },
          }}
          invisible={!currPower}
          badgeContent={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              {currPower && (
                <Tooltip title={currPower}>
                  <Box
                    width="1.2dvh"
                    height="1.2dvh"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <img
                      src={specialPConfig.get(currPower)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'scale-down',
                      }}
                    />
                  </Box>
                </Tooltip>
              )}
              {currPaddle && (
                <Tooltip title={currPaddle}>
                  <Box
                    width="1.2dvh"
                    height="1.2dvh"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <img
                      src={paddleConfig.get(currPaddle)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'scale-down',
                      }}
                    />
                  </Box>
                </Tooltip>
              )}
            </Stack>
          }
        >
          <UserAvatar
            color="warning"
            variant={player ? 'plain' : 'soft'}
            src={user?.avatar}
            sx={{ width: '5dvh', height: '5dvh' }}
          />
        </Badge>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          sx={{ pl: 2 }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <LobbyGameTypography
              level={player ? 'body-lg' : 'body-md'}
              component={!player ? 'i' : undefined}
              color={player ? 'warning' : 'neutral'}
            >
              {user?.nickname ?? 'empty slot'}
            </LobbyGameTypography>
            {user?.id === lobbyOwner && (
              <Tooltip title="Sensei 🥋">
                <Chip color="warning" variant="plain" size="sm">
                  <CrownIcon size="sm" fontSize="sm" />
                </Chip>
              </Tooltip>
            )}
            {isMe && (
              <>
                <IconButton size="sm" sx={{ borderRadius: 'xl' }}>
                  <CogOutlineIcon onClick={() => setOpenModal(true)} />
                </IconButton>
                <EditSettingsModal
                  open={openedModal}
                  setCurrPower={setCurrPower}
                  setCurrPaddle={setCurrPaddle}
                  handleCloseModalSendOptions={handleCloseModalSendOptions}
                  currPower={currPower!}
                  currPaddle={currPaddle!}
                />
              </>
            )}
          </Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            {ready && (
              <Chip color="success" variant="plain" size="sm">
                <CheckIcon />
              </Chip>
            )}
            {player && (
              <Chip
                color="warning"
                variant="plain"
                size="sm"
                startDecorator={<TrophyAwardIcon />}
              >
                {user?.leaderboard.elo || 0}
              </Chip>
            )}
          </Stack>
        </Box>
        <Box display="flex" alignItems="center" gap={1} ml="auto">
          {!id ? (
            <>
              {currentUserId === lobbyOwner && (
                <AddBotButton teamId={teamId} teamPosition={teamPosition} />
              )}
              <ChangeTeamButton teamId={teamId} teamPosition={teamPosition} />
            </>
          ) : (
            <>
              <ChangeOwnerButton id={id} ownerId={lobbyOwner} />
              <KickParticipantButton id={id} ownerId={lobbyOwner} />
            </>
          )}
        </Box>
      </Stack>
      <Divider />
    </>
  );
}
