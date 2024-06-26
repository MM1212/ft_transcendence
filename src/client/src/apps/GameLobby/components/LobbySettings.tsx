import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import {
  Avatar,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Sheet,
  Stack,
  Switch,
  Typography,
} from '@mui/joy';
import React from 'react';
import { Box } from '@mui/joy';
import { useCurrentUser } from '@hooks/user';
import LobbyGameTypography from './LobbyGameTypography';
import SoccerIcon from '@components/icons/SoccerIcon';
import { FormHelperText } from '@mui/joy';
import PongModel from '@typings/models/pong';
import tunnel from '@lib/tunnel';
import notifications from '@lib/notifications/hooks';
import { ArrowSelector } from '@components/ArrowSelector/ArrowSelector';
import { ballsConfig } from '@components/ArrowSelector/ItemConfigs';
import CogIcon from '@components/icons/CogIcon';
import LobbyPongButton from './LobbyPongBottom';
import ContentSaveIcon from '@components/icons/ContentSaveIcon';
import { alpha } from '@theme';

export function LobbySettings() {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const self = useCurrentUser();

  const [open, setOpen] = React.useState<boolean>(false);
  const [score, setScore] = React.useState<string>(lobby.score.toString());
  const [powersSwitchValue, setPowersSwitchValue] = React.useState<boolean>(
    lobby.gameType === PongModel.Models.LobbyGameType.Powers ? true : false
  );
  const [errors, setErrors] = React.useState({
    name: '',
    score: '',
  });
  const [currBall, setCurrBall] = React.useState<string>(lobby.ballTexture);
  const [loading, setLoading] = React.useState(false);
  const handleSubmitModalClose = useRecoilCallback(
    (ctx) => async (): Promise<void> => {
      try {
        if (score === '') {
          setErrors((prev) => ({ ...prev, score: 'Score is required' }));
          return;
        }
        if (parseInt(score) < 1) {
          setErrors((prev) => ({ ...prev, score: 'Score must be at least 1' }));
          return;
        }
        if (parseInt(score) > 100) {
          setErrors((prev) => ({
            ...prev,
            score: 'Score must be at most 100',
          }));
          return;
        }
        setLoading(true);
        const updatedLobby = await tunnel.post(
          PongModel.Endpoints.Targets.UpdateLobbySettings,
          {
            lobbyId: lobby.id,
            score: parseInt(score),
            type: powersSwitchValue,
            ballSkin: currBall,
          }
        );
        ctx.set(pongGamesState.gameLobby, updatedLobby);
        setOpen(false);

        notifications.success('Lobby settings updated');
      } catch (error) {
        notifications.error(
          'Failed to submit lobby settings',
          (error as Error).message
        );
      } finally {
        setLoading(false);
      }
    },
    [lobby.id, score, powersSwitchValue, currBall]
  );

  const handleSwitchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPowersSwitchValue(event.target.checked);
  };

  const player = React.useMemo(
    () =>
      lobby.teams[0].players
        .concat(lobby.teams[1].players)
        .concat(lobby.spectators)
        .find((player) => player.id === self?.id),
    [lobby, self?.id]
  );

  if (player === undefined) return null;
  if (lobby === null) return null;
  return (
    <Box
      flex={1}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      { self?.id === lobby.ownerId ? (
        <>
          <LobbyPongButton
            onClick={() => setOpen(true)}
            startDecorator={<CogIcon />}
            label="Edit Settings"
            fullWidth
            disableMargin
          />
          <Modal open={open} onClose={handleSubmitModalClose}>
            <ModalDialog>
              <DialogTitle>Settings</DialogTitle>
              <Box display="flex" flexDirection="column" gap={1}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LobbyGameTypography>Game Ball:</LobbyGameTypography>
                  <React.Suspense fallback={null}>
                    <ArrowSelector
                      selectType="ball"
                      onClick={setCurrBall}
                      selected={currBall}
                    />
                  </React.Suspense>
                </Stack>
                <LobbyGameTypography
                  component="label"
                  endDecorator={
                    <Switch
                      sx={{ ml: 1 }}
                      color="warning"
                      checked={powersSwitchValue}
                      onChange={handleSwitchValue}
                    />
                  }
                >
                  Powers Activated
                </LobbyGameTypography>
                <FormControl>
                  <FormLabel required>
                    <LobbyGameTypography>Score</LobbyGameTypography>
                  </FormLabel>
                  <Input
                    placeholder="Enter Score"
                    type="number"
                    slotProps={{
                      input: {
                        min: 1,
                        max: 100,
                      },
                    }}
                    sx={{ width: '50%' }}
                    startDecorator={<SoccerIcon />}
                    required
                    color={errors.score ? 'danger' : 'warning'}
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                  {errors.score && <FormHelperText>{errors.score}</FormHelperText>}{' '}
                </FormControl>
              </Box>
              <LobbyPongButton
                disableMargin
                label="Save"
                startDecorator={<ContentSaveIcon />}
                loading={loading}
                onClick={handleSubmitModalClose}
              />
            </ModalDialog>
          </Modal>
        </>
      ) : null}
      <Sheet
        sx={{
          p: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          borderRadius: 'sm',
          bgcolor: (theme) =>
            alpha(theme.resolveVar('palette-background-surface'), 0.75),
        }}
        variant="outlined"
      >
        <LobbyGameTypography>
          Game Mode: <Typography color="neutral">{lobby.gameType}</Typography>
        </LobbyGameTypography>
        <Stack direction="row" spacing={1} alignItems="center">
          <LobbyGameTypography>Ball:</LobbyGameTypography>
          <Avatar size="sm" src={ballsConfig.get(lobby.ballTexture)} />
        </Stack>
        <LobbyGameTypography>
          Score to win: <Typography color="neutral">{lobby.score}</Typography>
        </LobbyGameTypography>
        <Box display="flex" gap={3} justifyContent="space-evenly">
          {Object.keys(player.keys!).map((key, i) => (
            <LobbyGameTypography textTransform="capitalize" key={i}>
              {key}:{' '}
              <KeyDisplayer
                keycode={player.keys![key as keyof typeof player.keys]}
              />
            </LobbyGameTypography>
          ))}
        </Box>
      </Sheet>
    </Box>
  );
}

export function KeyDisplayer({ keycode }: { keycode: string }) {
  return (
    <kbd
      style={{
        backgroundColor: '#eee',
        borderRadius: '3px',
        border: '1px solid #b4b4b4',
        boxShadow:
          '0 1px 1px rgba(0, 0, 0, 0.2),\n      0 2px 0 0 rgba(255, 255, 255, 0.7) inset',
        color: '#333',
        display: 'inline-block',
        fontWeight: '700',
        fontSize: '0.85em',
        padding: '2px 4px',
        lineHeight: '1',
        whiteSpace: 'nowrap',
      }}
    >
      {keycode}
    </kbd>
  );
}
