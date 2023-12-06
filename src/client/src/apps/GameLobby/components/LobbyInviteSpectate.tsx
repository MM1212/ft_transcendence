import { UserAvatar } from "@components/AvatarWithStatus";
import KarateIcon from "@components/icons/KarateIcon";
import { useUser } from "@hooks/user";
import { IconButton, Sheet } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import React from "react";


function DisplayStackedUser ({userId}: {userId: number}) {
  const user = useUser(userId);
  return (
    <Stack
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <UserAvatar src={user?.avatar} sx={{ width: 20, height: 20 }} />
      <Typography level="body-sm" sx={{ ml: 2 }}>
        {user?.nickname}
      </Typography>
      <IconButton sx={{ ml: "auto" }}>
        <KarateIcon />
      </IconButton>
    </Stack>
  )
}


export default function LobbyInviteSpectate(  {usersId, type} : {usersId: number[] , type: string }) {
  return (
    <>
      <Stack sx={{ width: "100" }}>
        {usersId.length > 0 ? (
          usersId.map((user, index) => (
            <React.Fragment key={index}>
            <DisplayStackedUser userId={user} />
              <Divider sx={{ mb: 2 }} />
            </React.Fragment>
          ))
        ) : (
          <Typography level="body-sm">{type}</Typography>
        )}
      </Stack>
    </>
  );
}
