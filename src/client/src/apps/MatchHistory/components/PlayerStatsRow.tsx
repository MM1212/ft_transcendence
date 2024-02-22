import { UserAvatar } from '@components/AvatarWithStatus';
import ProfileTooltip from '@components/ProfileTooltip';
import CrownIcon from '@components/icons/CrownIcon';
import { useUser } from '@hooks/user';
import { Avatar, Grid, Tooltip } from '@mui/joy';
import { Stack, Typography } from '@mui/joy';
import PongHistoryModel from '@typings/models/pong/history';
import { statsMapping } from '../constants';
import { specialPConfig } from '@components/ArrowSelector/ItemConfigs';

function AddStatsBoard({
  value,
  textColor,
}: {
  value: string;
  textColor?: string;
}) {
  return (
    <Typography
      textColor={textColor}
      style={{
        display: 'flex',
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
  if (user === null) return null;
  const textColor = player.isSelf ? 'warning.300' : 'neutral';
  return (
    <Grid container xs={12}>
      <Grid container xs={4}>
        <Stack spacing={1} direction="row" alignItems="center">
          <Avatar
            variant="outlined"
            sx={{ borderRadius: 'sm', p: 0.5 }}
            size="sm"
          >
            <img
              src={specialPConfig.get(player.gear.specialPower)}
              alt={player.gear.specialPower}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'scale-down',
              }}
            />{' '}
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
      </Grid>
      {statsMapping.map(
        (stat, index) =>
          player.stats[stat.statKey] !== null && (
            <Grid xs key={index} container justifyContent="right">
              <AddStatsBoard value={String(player.stats[stat.statKey])} />
            </Grid>
          )
      )}
    </Grid>
  );
}
