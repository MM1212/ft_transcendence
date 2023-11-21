import { useCurrentUser, useSession } from "@hooks/user";
import { Button } from "@mui/joy";
import { Avatar, Box, Sheet } from "@mui/joy";

export function LobbyMatchMaking() {
  const user = useCurrentUser();
  if (user === null) return;
  return (
    <Sheet
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "unset",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Avatar
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
          })}
          src={user?.avatar}
        ></Avatar>
      </Box>
      <Button
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "20dvh",
          radiusBorder: "50%",
        }}
      ></Button>
    </Sheet>
  );
}
