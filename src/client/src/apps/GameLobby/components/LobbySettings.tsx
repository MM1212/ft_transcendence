import { useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import {
  Avatar,
  ListDivider,
  ListItemDecorator,
  Option,
  Select,
  SelectOption,
  Stack,
  Typography,
} from '@mui/joy';
import React from 'react';
import PongModel from '@typings/models/pong';
import { Box } from '@mui/joy';
import { useCurrentUser } from '@hooks/user';

export function LobbySettings() {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const gameModeOptions = [
    { value: 1, label: 'POWERS' },
    { value: 2, label: 'CLASSIC' },
  ];
  const self = useCurrentUser();
  const player = React.useMemo(
    () =>
      lobby.teams[0].players
        .concat(lobby.teams[1].players)
        .concat(lobby.spectators)
        .find((player) => player.id === self?.id),
    [lobby, self?.id]
  );

  const ballTexture = [
    {
      value: 1,
      label: 'BOLA 1',
      src: PongModel.Endpoints.Targets.BallTexture1,
    },
    {
      value: 2,
      label: 'BOLA 2',
      src: PongModel.Endpoints.Targets.PowerWaterTexture,
    },
    {
      value: 3,
      label: 'BOLA 3',
      src: PongModel.Endpoints.Targets.PowerIceTexture,
    },
  ];
  const backgroundTexture = [
    {
      value: 1,
      label: 'BACKGROUND 1',
      src: PongModel.Endpoints.Targets.MarioBoxTexture,
    },
    {
      value: 2,
      label: 'BACKGROUND 2',
      src: PongModel.Endpoints.Targets.MarioBoxTexture,
    },
    {
      value: 3,
      label: 'BACKGROUND 3',
      src: PongModel.Endpoints.Targets.MarioBoxTexture,
    },
  ];

  function renderValue(option: SelectOption<number> | null) {
    if (!option) {
      return null;
    }

    return (
      <Stack direction="row" alignItems="center" spacing={1} width="100%">
        <Avatar
          size="sm"
          src={ballTexture.find((o) => o.value === option.value)?.src}
        />
        <Typography>{option.label}</Typography>
      </Stack>
    );
  }
  function renderValue2(option: SelectOption<number> | null) {
    if (!option) {
      return null;
    }

    return (
      <Stack direction="row" alignItems="center" spacing={1} width="100%">
        <Avatar
          size="sm"
          src={backgroundTexture.find((o) => o.value === option.value)?.src}
        />
        <Typography>{option.label}</Typography>
      </Stack>
    );
  }

  if (player === undefined) return null;
  if (lobby === null) return null;
  return (
    <>
      <Typography>Game Mode:</Typography>
      <Select defaultValue={1}>
        {gameModeOptions.map((option) => (
          <React.Fragment key={option.value}>
            <Option value={option.value} label={option.label}>
              {option.label}
            </Option>
          </React.Fragment>
        ))}
      </Select>
      <Typography>Ball Texture:</Typography>
      <Select defaultValue={1} renderValue={renderValue}>
        {ballTexture.map((option, index) => (
          <React.Fragment key={option.value}>
            {index !== 0 ? (
              <ListDivider role="none" inset="startContent" />
            ) : null}
            <Option value={option.value}>
              <ListItemDecorator>
                <Avatar size="sm" src={option.src} />
              </ListItemDecorator>
              {option.label}
            </Option>
          </React.Fragment>
        ))}
      </Select>

      <Typography>Background Texture:</Typography>
      <Select defaultValue={1} renderValue={renderValue2}>
        {backgroundTexture.map((option, index) => (
          <React.Fragment key={option.value}>
            {index !== 0 ? (
              <ListDivider role="none" inset="startContent" />
            ) : null}
            <Option value={option.value}>
              <ListItemDecorator>
                <Avatar size="sm" src={option.src} />
              </ListItemDecorator>
              {option.label}
            </Option>
          </React.Fragment>
        ))}
      </Select>
      <Typography>Currrent Keys: </Typography>

      <Box display="flex" gap={3} justifyContent="space-evenly">
        {Object.keys(player.keys).map((key, i) => (
          <Typography textTransform="capitalize" key={i}>
            {key}:{' '}
            <KeyDisplayer
              keycode={player.keys[key as keyof typeof player.keys]}
            />
          </Typography>
        ))}
      </Box>
    </>
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
