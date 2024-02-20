import { Box, Divider, Stack, Tooltip, Typography } from '@mui/joy';
import PlayerStatsRow from './PlayerStatsRow';
import React, { ReactElement } from 'react';
import PongHistoryModel from '@typings/models/pong/history';
import { useCurrentUser } from '@hooks/user';
import { statsMapping } from '../constants';

function IconStats({
  icon,
  gridColumnStart,
  statValue,
  message,
  first,
}: {
  icon: ReactElement;
  gridColumnStart: number;
  statValue: React.ReactNode;
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
          {statValue}
        </Typography>
        <Tooltip title={message}>{icon}</Tooltip>
      </Stack>
    </Box>
  );
}

export default function MatchHistoryScoreBoard(
  match: PongHistoryModel.Models.Match
) {
  const session = useCurrentUser();
  if (!session) return null;

  const teamPlayersAccumulatedStats = match.teams.map((team) =>
    team.players.reduce(
      (acc, player) => {
        (
          Object.keys(
            player.stats
          ) as (keyof PongHistoryModel.Models.PlayerStats)[]
        ).forEach((key) => {
          switch (typeof key) {
            case 'number':
              acc[key] = (acc[key] || 0) + player.stats[key];
              break;
            case 'boolean':
              acc[key] = acc[key] || false || player.stats[key];
              break;
            default:
              acc[key] = player.stats[key];
              break;
          }
        });
        return acc;
      },
      {} as Record<string, unknown>
    )
  );
  return (
    <>
      {match.teams.map((team, index) => (
        <>
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
            {statsMapping.map(
              (stat, iconIndex) =>
                teamPlayersAccumulatedStats[index][stat.statKey] !== null && (
                  <IconStats
                    key={iconIndex}
                    icon={stat.icon}
                    gridColumnStart={iconIndex + 2}
                    statValue={
                      (teamPlayersAccumulatedStats[index][
                        stat.statKey
                      ] as React.ReactNode) ?? 'N/A'
                    }
                    first={index === 0}
                    message={stat.label}
                  />
                )
            )}
            {team.players.map((player, i) => (
              <PlayerStatsRow
                key={i}
                {...player}
                isSelf={player.userId === session.id}
              />
            ))}
          </Box>
          {index === 0 && <Divider />}
        </>
      ))}
    </>
  );
}
