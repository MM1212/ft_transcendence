import { UserAvatar } from "@components/AvatarWithStatus";
import ProfileTooltip from "@components/ProfileTooltip";
import FireIcon from "@components/icons/FireIcon";
import { useUser } from "@hooks/user";
import { Avatar } from "@mui/joy";
import { Box, Stack, Typography } from "@mui/joy";
import PongModel from "@typings/models/pong";
import PongHistoryModel from "@typings/models/pong/history";
import { randomInt } from "@utils/random";

export default function PlayerStatsRow(player: PongHistoryModel.Models.Player & {
  isSelf: boolean;
}) {
  const user = useUser(player.userId);
  const superPowers = [
    PongModel.Endpoints.Targets.PowerIceTexture,
    PongModel.Endpoints.Targets.PowerSparkTexture,
    PongModel.Endpoints.Targets.PowerWaterTexture,
  ];
  if (user === null) return null;
  const textColor = player.isSelf ? "warning.300" : "neutral";
  function AddStatsBoard({
    gridColumnStart,
    value,
  }: {
    gridColumnStart: number;
    value: string;
  }) {
    return (
      <Typography
        textColor={textColor}
        style={{
          display: "grid",
          gridColumnStart: gridColumnStart,
          alignItems: "center",
          justifySelf: "right",
        }}
        level="body-md"
      >
        {value}
      </Typography>
    );
  }

  return (
    <>
      <Box style={{ display: "grid", gridColumnStart: "1", alignSelf: "left" }}>
        <Stack spacing={1} direction="row" alignItems="center">
          <Avatar
            variant="outlined"
            sx={{ borderRadius: "sm", p: 0.5 }}
            size="sm"
            src={superPowers[randomInt(0, 3)]}
            style={{}}
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
          >
            {user.nickname}
          </Typography>
        </Stack>
      </Box>
      <AddStatsBoard gridColumnStart={2} value={randomInt(100, 2000).toString()} />
      <AddStatsBoard gridColumnStart={3} value={randomInt(60, 210).toString()} />
      <AddStatsBoard gridColumnStart={4} value={randomInt(0, 10).toString()} />
      <AddStatsBoard gridColumnStart={5} value={randomInt(1, 10).toString()} />
      <AddStatsBoard gridColumnStart={6} value={randomInt(1, 1592).toString()} />
      <Typography
        textColor={textColor}
        style={{
          display: "grid",
          gridColumnStart: '7',
          alignItems: "center",
          alignSelf: "left",
          justifySelf: "right",
        }}
        level="body-md"
      >
        {randomInt(0, 10).toString()}
      </Typography>

    </>
  );
}
