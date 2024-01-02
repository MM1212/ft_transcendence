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

export default function MatchHistoryScoreBoard() {
  const teams = ['Team 1', 'Team 2'];

  const iconMapping: ReactElement[] = [
    <WallIcon key={0} />,
    <ShimmerIcon key={1} />,
    <FireIcon key={2} />,
    <SoccerIcon key={3} />,
    <CurrencyTwdIcon key={4} />,
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
    team,
    message,
  }: {
    icon: ReactElement;
    gridColumnStart: number;
    nbGols: number;
    team: string;
    message: string;
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
          <Typography
            textColor={team === 'Team 1' ? 'primary.300' : 'danger.400'}
          >
            {nbGols}
          </Typography>
          <Tooltip title={message}>{icon}</Tooltip>
        </Stack>
      </Box>
    );
  }
  return (
    <>
      {teams.map((team, index) => (
        <>
          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: '5fr 7fr 4fr 4fr 4fr 4fr 4fr',
              justifyItems: 'left',
              p: 1,
              borderRadius: 'md',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              style={{
                display: 'grid',
                gridColumnStart: '1',
                alignSelf: 'left',
              }}
              textColor={team === 'Team 1' ? 'primary.300' : 'danger.400'}
            >
              {team}
            </Typography>
            {iconMapping.map((icon, index) => (
              <GetIconStats
                key={index}
                icon={icon}
                gridColumnStart={index + 2}
                nbGols={randomInt(0, 10)}
                team={team}
                message={labelMapping[index]}
              />
            ))}
          </Stack>
          <PlayerStatsRow id={randomInt(1, 10)} />
          <PlayerStatsRow id={randomInt(1, 10)} />
          {index !== teams.length - 1 && <Divider />}
        </>
      ))}
    </>
  );
}
