import { Box, Sheet, Stack } from "@mui/joy";
import AvatarWithStatus from "@components/AvatarWithStatus";
import UsersModel from "@typings/models/users";
import MedalIcon from "@components/icons/MedalIcon";
import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import ProfileTooltip from "@components/ProfileTooltip";
import { fourth } from "../styles";

export default function LeaderBoardUser({
  user,
  points,
  position,
  winsLoses,
}: {
  position: number;
  user: UsersModel.Models.IUserInfo;
  points: number;
  winsLoses: string;
}) {
  return (
    <Sheet
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 4fr 9.2fr 6.2fr",
        alignItems: "center",
        justifyItems: "center",
        p: 1,
        borderRadius: "md",
        justifyContent: "space-between",
      }}
      variant="outlined"
    >
      <Stack sx={{ display: "grid", gridTemplateColumns: "subgrid" }}>
        {position < 4 ? (
          <MedalIcon
            sx={{
              fontSize: "1.8rem",
              color:
                position === 3
                  ? "#cd7f32"
                  : position === 2
                    ? "#b0bec5"
                    : position === 1
                      ? "#fbc02d"
                      : undefined,
            }}
          />
        ) : (
          <LobbyGameTypography
            level="h3"
            sx={{
              display: "grid",
              gridTemplateColumns: "subgrid",
              gridColumnStart: "1",
              py: 1,
              alignItems: "center",
              border: "unset",
            }}
          >
            {position}
          </LobbyGameTypography>
        )}
      </Stack>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "subgrid",
          gridColumnStart: "3",
          justifySelf: "left",
        }}
      >
        <Stack spacing={2} direction='row' style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
        <ProfileTooltip user={user} placement="left-start">
          <AvatarWithStatus src={user.avatar} status={user.status} size="md" />
        </ProfileTooltip>
        <LobbyGameTypography level="body-md">
          {user.nickname}
        </LobbyGameTypography>
        </Stack>
      </Box>
      <LobbyGameTypography
        style={{
          display: "grid",
          gridTemplateColumns: "subgrid",
          gridColumnStart: "4",
          justifySelf: "left",
        }}
        level="body-md"
      >
        {points}
      </LobbyGameTypography>
      <LobbyGameTypography
        style={{
          display: "grid",
          gridTemplateColumns: "subgrid",
          gridColumnStart: "5",
          justifySelf: "left",
        }}
        level="body-md"
      >
        {winsLoses}
      </LobbyGameTypography>
    </Sheet>
  );
}
