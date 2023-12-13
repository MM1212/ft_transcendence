import { backGroundImg } from "@apps/Achievements/components/AchievementLogo";
import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import AvatarWithStatus from "@components/AvatarWithStatus";
import ProfileTooltip from "@components/ProfileTooltip";
import NearMeIcon from "@components/icons/NearMeIcon";
import { useCurrentUser, useSession, useUser } from "@hooks/user";
import { CardCover } from "@mui/joy";
import { Box, Card, Stack, Typography } from "@mui/joy";

export default function PlayerStatsRow({ id }: { id: number }) {
  const user = useUser(id);
  const myUser = useCurrentUser();
  if (user === null) return null;
  if (myUser === null) return null;
  const textColor = user.id === myUser.id ? "warning.300" : "neutral";
   console.log(user);
   console.log(myUser);
  return (
    <Stack
      sx={{
        display: "grid",
        gridTemplateColumns: "5fr 7fr 4fr 4fr",
        justifyItems: "left",
        p: 1,
        borderRadius: "md",
        justifyContent: "space-between",
      }}
    >
      <Box style={{ display: "grid", gridColumnStart: "1", alignSelf: "left" }}>
        <Stack
          spacing={2}
          direction="row"
          style={{ display: "flex", alignItems: "center" }}
        >
          <ProfileTooltip user={user} placement="left-start">
            <AvatarWithStatus
              src={user.avatar}
              status={user.status}
              size="md"
            />
          </ProfileTooltip>
          <Typography textColor={textColor} level="body-sm">
            {user.nickname}
          </Typography>
        </Stack>
      </Box>
      <Card
        style={{
          width: "70%",
          height: "70%",
          display: "grid",
          gridColumnStart: "2",
          justifySelf: "center",
          alignSelf: "center",
        }}
      >
        1
        <CardCover>
          <img src={backGroundImg} />
        </CardCover>
      </Card>
      <Typography
        textColor={textColor}
        style={{
          display: "grid",
          gridColumnStart: "3",
          alignItems: "center",
          alignSelf: "left",
          justifySelf: "right",
        }}
        level="body-md"
      >
        3
      </Typography>
      <Typography
        textColor={textColor}
        style={{
          display: "grid",
          gridColumnStart: "4",
          alignItems: "center",
          alignSelf: "left",
          justifySelf: "right",
        }}
        level="body-md"
      >
        15,234
      </Typography>
    </Stack>
  );
}
