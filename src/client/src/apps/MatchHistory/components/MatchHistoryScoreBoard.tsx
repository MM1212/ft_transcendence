import { Box, Divider, Stack, Tooltip, Typography } from '@mui/joy';
import PlayerStatsRow from './PlayerStatsRow';
import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import SoccerIcon from '@components/icons/SoccerIcon';
import { randomInt } from '@utils/random';
import FireIcon from '@components/icons/FireIcon';
import React, { ReactElement } from 'react';
import ShimmerIcon from '@components/icons/ShimmerIcon';
import WallIcon from '@components/icons/WallIcon';
import StarFourPointsIcon from '@components/icons/StarFourPointsIcon';
import PongHistoryModel from '@typings/models/pong/history';
import { useCurrentUser } from '@hooks/user';

export default function MatchHistoryScoreBoard(
  match: PongHistoryModel.Models.Match
) {
  const session = useCurrentUser();
  if (!session) return null;
  const iconMapping: ReactElement[] = [
    <WallIcon key={0} />,
    <ShimmerIcon key={1} />,
    <FireIcon key={2} />,
    <SoccerIcon key={3} />,
    <CurrencyTwdIcon key={4} />,
    <StarFourPointsIcon key={5} />,
    <StarFourPointsIcon key={5} />,
  ];

  const labelMapping: string[] = [
    'Bonces on your paddle',
    'Most Bounces',
    'Special Power',
    'Goals Scored',
    'Gold',
    'Player Score',
  ];

  function GetIconStats({
    icon,
    gridColumnStart,
    nbGols,
    message,
    first
  }: {
    icon: ReactElement;
    gridColumnStart: number;
    nbGols: number;
    message: string;
    first: boolean;
  }) {
    return (
      <Box
        style={{
          justifySelf: 'right',
          display: 'grid',
          gridColumnStart: gridColumnStart,
        }}
      >
        <Stack
          gap={1.5}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Typography textColor={first ? 'primary.300' : 'danger.400'}>
            {nbGols}
          </Typography>
          <Tooltip title={message}>{icon}</Tooltip>
          <Tooltip title={message}>{icon}</Tooltip>
        </Stack>
      </Box>
    );
  }
  return (
    <>
      {match.teams.map((team, index) => (
        <>
          <Box
          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: '5fr 7fr 4fr 4fr 4fr 4fr 4fr',
              p: 1,
              borderRadius: 'md',
              justifySelf: 'left',
            }}
          >
            <Typography
              style={{
                display: 'grid',
                gridColumnStart: '1',
                alignSelf: 'left',
              }}
              textColor={index === 0 ? 'primary.300' : 'danger.400'}
            >
              Team {index + 1}
            </Typography>
            {iconMapping.map((icon, iconIndex) => (
              <GetIconStats
                key={iconIndex}
                icon={icon}
                gridColumnStart={iconIndex + 2}
                nbGols={randomInt(0, 10)}
                first={index === 0}
                message={labelMapping[iconIndex]}
              />
            ))}
            {team.players.map((player, i) => (
              <PlayerStatsRow key={i} {...player} isSelf={player.userId === session.id} />
            ))}
          </Box>
          {index === 0 && <Divider />}
        </>
      ))}
    </>
  );
}
