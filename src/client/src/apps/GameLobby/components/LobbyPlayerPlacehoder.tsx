import { UserAvatar } from "@components/AvatarWithStatus";
import AccountArrowDownIcon from "@components/icons/AccountArrowDownIcon";
import AccountPlusIcon from "@components/icons/AccountPlusIcon";
import RobotIcon from "@components/icons/RobotIcon";
import SwapHorizontalBoldIcon from "@components/icons/SwapHorizontalBoldIcon";
import { useUser } from "@hooks/user";
import { Box, Divider, IconButton } from "@mui/joy";
import { Typography } from "@mui/joy";
import { Stack } from "@mui/joy";

export default function LobbyPlayerPlaceholder({ id, position }: { id: number, position: number}) {
  const user = useUser(id);
  return (
    <>
      <Divider />
      <Stack display="flex" flexDirection="row" sx={{ pt: 2, pb: 2 }}>
        <UserAvatar color='warning' variant='soft'  src={user?.avatar} sx={{ width: 50, height: 50 }} />
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          sx={{ pl: "20px" }}
        >
          <Typography  level="body-lg">{user?.nickname}</Typography>
          <Typography  level="body-sm">Rank Placeholder</Typography>
        </Box>
        {id === 0 ? (
          <IconButton
          color='warning' variant='plain' 
            size="lg"
            sx={{
              marginLeft: "auto",
              "&:hover": {
                backgroundColor: "unset",
              },
            }}
          >
            <RobotIcon  />
            <SwapHorizontalBoldIcon  />
          </IconButton>
        ) : null}
      </Stack>
      <Divider />
    </>
  );
}
