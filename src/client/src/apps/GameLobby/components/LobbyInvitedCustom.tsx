import { UserAvatar } from "@components/AvatarWithStatus";
import BookMarkerIcon from "@components/icons/BookMarkerIcon";
import BookmarkRemoveIcon from "@components/icons/BookmarkRemoveIcon";
import CloseIcon from "@components/icons/CloseIcon";
import { useUser } from "@hooks/user";
import { IconButton, Sheet } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import UsersModel from "@typings/models/users";

export default function LobbyInvitedCustom() {
  const usersSample: (UsersModel.Models.IUserInfo | null)[] = [
    useUser(1) ?? null,
    useUser(2) ?? null,
    useUser(3) ?? null,
    useUser(4) ?? null,
    useUser(5) ?? null,
  ];

  return (
    <>
      <Stack sx={{ width: "100" }}>
        {usersSample.map((user, index) => (
          <>
            <Stack
              key={index}
              sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
            >
              <UserAvatar src={user?.avatar}  sx={{ width: 20, height: 20 }} />
              <Typography level="body-sm" sx={{ ml: 2 }}>{user?.nickname}</Typography>
              <IconButton sx={{ml:'auto'}}>
              <CloseIcon/>
              </IconButton>
            </Stack>
            <Divider sx={{mb:2}} />
          </>
        ))}
      </Stack>
    </>
  );
}
