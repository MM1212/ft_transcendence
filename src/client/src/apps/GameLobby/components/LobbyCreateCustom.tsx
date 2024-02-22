import {
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
import { LobbySelfBanner } from './LobbyPlayerBanner';
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
import LobbyPongButton from './LobbyPongBottom';
import { FindMatchWrapper } from './LobbyMatchMaking';
import KeyIcon from '@components/icons/KeyIcon';
import SoccerIcon from '@components/icons/SoccerIcon';

export default function LobbyCreateCustom() {
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [spectators, setSpectators] = React.useState<string>(
    PongModel.Models.LobbySpectatorVisibility.All
  );
  const [errors, setErrors] = React.useState({
    name: '',
    score: '',
  });
  const [score, setScore] = React.useState<string>('7');
  const isCustom = useRecoilValue(pongGamesState.isInLobby);

  const validateForm = () => {
    const newErrors = {
      name: name.trim() === '' ? 'Name is required' : '',
      score: score.trim() === '' ? 'Score is required' : '',
    };
    if (name.trim().length > 20) {
      newErrors.name = 'Name cannot exceed 20 characters';
    }
    const scoreNum = parseInt(score.trim());
    console.log(scoreNum);
    if (isNaN(scoreNum)) {
      newErrors.score = 'Score must be a number';
    } else if (scoreNum < 1 || scoreNum > 100) {
      newErrors.score = 'Score must be between 1 and 100';
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const [loading, setLoading] = React.useState(false);
  const handleCreateRoom = useRecoilCallback((ctx) => async () => {
    if (validateForm()) {
      const pass = password.trim() === '' ? null : password.trim();
      const payload = {
        password: pass,
        name: name.trim() as string,
        spectators: spectators as PongModel.Models.LobbySpectatorVisibility,
        lobbyType: PongModel.Models.LobbyType.Custom,
        lobbyAccess:
          pass !== ''
            ? PongModel.Models.LobbyAccess.Protected
            : PongModel.Models.LobbyAccess.Public,
        gameType: PongModel.Models.LobbyGameType.Powers,
        score: parseInt(score.trim()),
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
          <LobbySelfBanner showSelector={false} />
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
                  slotProps={{
                    input: {
                      maxLength: 20,
                    },
                  }}
                  startDecorator={<LabelIcon />}
                  endDecorator={
                    <Typography level="body-sm">{name.length}/20</Typography>
                  }
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
                  startDecorator={<KeyIcon />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel required>
                  <LobbyGameTypography level="body-sm">
                    Score
                  </LobbyGameTypography>
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
                {errors.score && (
                  <FormHelperText>{errors.score}</FormHelperText>
                )}{' '}
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
                  color="warning"
                >
                  <Stack spacing={5} sx={{ mt: 2 }}>
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.All}
                      size="sm"
                      label="All"
                      color="warning"
                    />
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.Friends}
                      size="sm"
                      label="Friends Only"
                      color="warning"
                    />
                    <Radio
                      value={PongModel.Models.LobbySpectatorVisibility.None}
                      size="sm"
                      label="None"
                      color="warning"
                    />
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Stack>
          </Box>
          <FindMatchWrapper
            sx={{
              position: 'relative',
            }}
          >
            <LobbyPongButton
              onClick={handleCreateRoom}
              label="Create"
              loading={loading}
            />
          </FindMatchWrapper>
        </>
      ) : (
        <LobbyRoom />
      )}
    </Sheet>
  );
}
