import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  RadioGroup,
  Sheet,
} from '@mui/joy';
import { Stack } from '@mui/joy';
import React from 'react';
import LobbyPlayerBanner from './LobbyPlayerBanner';
import LabelIcon from '@components/icons/LabelIcon';
import { Typography } from '@mui/joy';
import { Box } from '@mui/joy';
import { Radio } from '@mui/joy';
import LobbyRoom from './LobbyRoom';
import LobbyGameTypography from './LobbyGameTypography';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import notifications from '@lib/notifications/hooks';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';

export default function LobbyCreateCustom() {
  // Create a logic that first inputs the user to create a custom or to join an existing room
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [gameType, setGameType] = React.useState<string>(
    PongModel.Models.LobbyGameType.Powers
  );
  const [spectators, setSpectators] = React.useState<string>(
    PongModel.Models.LobbySpectatorVisibility.All
  );
  const [errors, setErrors] = React.useState({
    name: '',
  });
  const isCustom = useRecoilValue(pongGamesState.isInLobby);

  const validateForm = () => {
    const newErrors = {
      name: name.trim() === '' ? 'Name is required' : '',
    };
    if (name.trim().length > 20) {
      newErrors.name = 'Name cannot exceed 20 characters';
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const [loading, setLoading] = React.useState(false);
  const handleCreateRoom = useRecoilCallback((ctx) => async () => {
    if (validateForm()) {
      const payload = {
        password: password.trim() === '' ? null : password.trim(),
        name: name.trim(),
        spectators: spectators as PongModel.Models.LobbySpectatorVisibility,
        lobbyType: PongModel.Models.LobbyType.Custom,
        gameType: gameType as PongModel.Models.LobbyGameType,
      };
      const notif = notifications.default('Creating lobby...');
      try {
        setLoading(true);
        const lobby = await tunnel.put(
          PongModel.Endpoints.Targets.NewLobby,
          payload
        );
        notif.update({
          message: 'Lobby created successfully!',
          color: 'success',
        });

        ctx.set(pongGamesState.gameLobby, lobby);
        
        console.log(lobby);
      } catch (error) {
        notifications.error('Failed to create lobby', (error as Error).message);
      } finally {
        setLoading(false);
      }
    }
  });

  // BEFORE:
  //const handleCreateRoom = async () => {
  //  if (validateForm()) {
  //    try {
  //      const lobby = await tunnel.put(
  //        PongModel.Endpoints.Targets.NewLobby,
  //        {
  //          password: password.trim() === "" ? null : password.trim(),
  //          name: name.trim(),
  //          spectators: spectators as PongModel.Models.LobbySpectatorVisibility,
  //          lobbyType: PongModel.Models.LobbyType.Custom,
  //          gameType: gameType as PongModel.Models.LobbyGameType,
  //        }
  //      )
  //      console.log(lobby);
  //    } catch (error) {
  //      notifications.error('Failed to create lobby', (error as Error).message);
  //    }
  //  }
  //};

  return (
    <Sheet
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'unset',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {!isCustom ? (
        <>
          <LobbyPlayerBanner id={1} />
          <Divider sx={{ mt: 4 }} />
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            <Stack spacing={2} sx={{ display: 'flex', mt: 5 }}>
              <FormControl>
                <FormLabel required>
                  <LobbyGameTypography level="body-sm">
                    Name
                  </LobbyGameTypography>
                </FormLabel>
                <Input
                  color={errors.name ? 'danger' : 'warning'}
                  required
                  placeholder="Enter room name"
                  startDecorator={<LabelIcon />}
                  endDecorator={<Typography level="body-sm">0/20</Typography>}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <FormHelperText>{errors.name}</FormHelperText>}{' '}
              </FormControl>
              <FormControl>
                <FormLabel>
                  <LobbyGameTypography level="body-sm">
                    Password (optional)
                  </LobbyGameTypography>
                </FormLabel>
                <Input
                  placeholder="Enter Password"
                  color="warning"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
            </Stack>
            <Stack
              sx={{
                alignItems: 'center',
                width: '100%',
                display: 'flex',
                mt: 5,
                flexDirection: 'column',
              }}
            >
              <FormControl
                sx={{ mt: 2, display: 'flex', flexDirection: 'column' }}
              >
                <FormLabel>
                  {' '}
                  <LobbyGameTypography level="body-md">
                    ALLOW SPECTATORS
                  </LobbyGameTypography>
                </FormLabel>
                <RadioGroup
                  defaultValue={PongModel.Models.LobbySpectatorVisibility.All}
                  name="Spectator-Radio"
                  onChange={(ev) =>
                    setSpectators(
                      ev.target
                        .value as PongModel.Models.LobbySpectatorVisibility
                    )
                  }
                >
                  <Stack spacing={5} sx={{ mt: 2 }}>
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.All}
                      size="sm"
                      label="All"
                    />
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.Friends}
                      size="sm"
                      label="Friends Only"
                    />
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.None}
                      size="sm"
                      label="None"
                    />
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </Box>
          <Button
            sx={{ width: '25%', mt: 5 }}
            type="submit"
            variant="outlined"
            onClick={handleCreateRoom}
          >
            Create
          </Button>
        </>
      ) : (
        <LobbyRoom />
      )}
    </Sheet>
  );
}
