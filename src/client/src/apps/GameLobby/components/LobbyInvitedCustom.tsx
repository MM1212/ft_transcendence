import { UserAvatar } from "@components/AvatarWithStatus";
import CloseIcon from "@components/icons/CloseIcon";
import { IconButton } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import React from "react";
import { useRecoilValue } from "recoil";
import pongGamesState from "../state";

export default function LobbyInvitedCustom() {
  const invitingList = useRecoilValue(pongGamesState.gameLobby);
  if (invitingList === null) return null;
  return (
    <> 
      <Stack sx={{ width: "100" }}>
        {invitingList?.spectators.length > 0 ? (
          invitingList?.spectators.map((user, index) => (
      
            <React.Fragment key={index}>
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
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
            </React.Fragment>
          ))
        ) : (
          <Typography level="body-sm">No pending invites</Typography>
        )}
      </Stack>
    </>
  );
}
