import { UserAvatar } from '@components/AvatarWithStatus';
import ProfileTooltip from '@components/ProfileTooltip';
import CrownIcon from '@components/icons/CrownIcon';
import FireIcon from '@components/icons/FireIcon';
import { useUser } from '@hooks/user';
import { Avatar, Tooltip } from '@mui/joy';
import { Box, Stack, Typography } from '@mui/joy';
import PongModel from '@typings/models/pong';
import PongHistoryModel from '@typings/models/pong/history';
import { randomInt } from '@utils/random';
import { statsMapping } from '../constants';

function AddStatsBoard({
  gridColumnStart,
  value,
  textColor,
}: {
  gridColumnStart: number;
  value: string;
  textColor?: string;
}) {
  return (
    <Typography
      textColor={textColor}
      style={{
        display: 'grid',
        gridColumnStart: gridColumnStart,
        alignItems: 'center',
        justifySelf: 'right',
      }}
      level="body-md"
    >
      {value}
    </Typography>
  );
}

export default function PlayerStatsRow(
  player: PongHistoryModel.Models.Player & {
    isSelf: boolean;
  }
) {
  const user = useUser(player.userId);
  const superPowers = [
    PongModel.Endpoints.Targets.PowerIceTexture,
    PongModel.Endpoints.Targets.PowerSparkTexture,
    PongModel.Endpoints.Targets.PowerWaterTexture,
  ];
  if (user === null) return null;
  const textColor = player.isSelf ? 'warning.300' : 'neutral';
  return (
    <>
      <Box style={{ display: 'grid', gridColumnStart: '1', alignSelf: 'left' }}>
        <Stack spacing={1} direction="row" alignItems="center">
          <Avatar
            variant="outlined"
            sx={{ borderRadius: 'sm', p: 0.5 }}
            size="sm"
            src={superPowers[randomInt(0, 3)]}
          >
            <FireIcon size="xs" />
          </Avatar>
          <ProfileTooltip user={user} placement="left-start">
            <UserAvatar src={user.avatar} size="md" />
          </ProfileTooltip>
          <Typography
            textColor={textColor}
            level="body-sm"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            endDecorator={
              player.mvp ? (
                <Tooltip title="MVP">
                  <CrownIcon color="warning" />
                </Tooltip>
              ) : undefined
            }
          >
            {user.nickname}
          </Typography>
        </Stack>
      </Box>
      {statsMapping.map(
        (stat, index) =>
          player.stats[stat.statKey] !== null && (
            <AddStatsBoard
              key={index}
              gridColumnStart={index + 2}
              value={String(player.stats[stat.statKey])}
            />
          )
      )}
    </>
  );
}
