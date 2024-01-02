import { UserAvatar } from "@components/AvatarWithStatus";
import ProfileTooltip from "@components/ProfileTooltip";
import { useCurrentUser, useUser } from "@hooks/user";
import { Avatar, Grid } from "@mui/joy";
import { Box, Stack, Typography } from "@mui/joy";
import PongModel from "@typings/models/pong";
import { randomInt } from "@utils/random";

export default function PlayerStatsRow({ id }: { id: number }) {
  const user = useUser(id);
  const myUser = useCurrentUser();
  const superPowers = [
    PongModel.Endpoints.Targets.PowerIceTexture,
    PongModel.Endpoints.Targets.PowerSparkTexture,
    PongModel.Endpoints.Targets.PowerWaterTexture,
  ];
  if (user === null) return null;
  if (myUser === null) return null;
  const textColor = user.id === myUser.id ? "warning.300" : "neutral";
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
          alignSelf: "left",
          justifySelf: "right",
        }}
        level="body-md"
      >
        {value}
      </Typography>
    );
  }

  return (
    <Stack
      sx={{
        display: "grid",
        gridTemplateColumns: "5fr 7fr 4fr 4fr 4fr 4fr 4fr",
        justifyItems: "left",
        p: 1,
        borderRadius: "md",
        justifyContent: "space-between",
        backgroundColor: "background.level1",
      }}
    >
      <Box style={{ display: "grid", gridColumnStart: "1", alignSelf: "left" }}>
        <Stack spacing={1} direction="row" alignItems="center">
          <Avatar
            variant="outlined"
            sx={{ borderRadius: "sm", p: 0.5 }}
            size="sm"
            src={superPowers[randomInt(0, 3)]}
            style={{}}
          ></Avatar>
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

    </Stack>
  );
}
