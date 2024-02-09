import { useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import { Avatar, Button, DialogTitle, FormControl, FormLabel, Input, Modal, ModalDialog } from '@mui/joy';
import React from 'react';
import { Box } from '@mui/joy';
import { useCurrentUser } from '@hooks/user';
import LobbyGameTypography from './LobbyGameTypography';
import SoccerIcon from '@components/icons/SoccerIcon';
import { FormHelperText } from '@mui/joy';

export function LobbySettings() {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const self = useCurrentUser();

  const [open, setOpen] = React.useState<boolean>(false);
  const [score, setScore] = React.useState<string>(lobby.score.toString());
  const close = () => {
    console.log('submit');
    setOpen(false);
  };
  const [errors, setErrors] = React.useState({
    name: '',
    score: '',
  });

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
      }}
    >
      <Button onClick={() => setOpen(true)} />
      <Modal open={open} onClose={close}>
        <ModalDialog>
          <DialogTitle>Settings</DialogTitle>
          <Box>
            <LobbyGameTypography>Game Mode:</LobbyGameTypography>
            <LobbyGameTypography>Ball:</LobbyGameTypography>
            <FormControl
              sx={{
                display: 'flex',
                flexDirection: 'row',
              }}
            >
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
                startDecorator={<SoccerIcon />}
                required
                color={errors.score ? 'danger' : 'warning'}
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
              {errors.score && <FormHelperText>{errors.score}</FormHelperText>}{' '}
            </FormControl>
          </Box>
        </ModalDialog>
      </Modal>

      <LobbyGameTypography>
        Game Mode: {`${lobby.gameType}`}
      </LobbyGameTypography>
      <LobbyGameTypography>
        Ball:{' '}
        {
          <Avatar
            size="sm"
            src={lobby.ballTexture}
            sx={{
              display: 'inline-block',
            }}
          />
        }
      </LobbyGameTypography>
      <LobbyGameTypography>
        Score to win: {`${lobby.score}`}
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
