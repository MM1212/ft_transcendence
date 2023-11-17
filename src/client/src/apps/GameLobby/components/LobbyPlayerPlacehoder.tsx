import { Box, Divider } from "@mui/joy";
import { Avatar, Typography } from "@mui/joy";
import { Stack } from "@mui/joy";

export default function LobbyPlayerPlaceholder() {
  return (
    <>
      <Divider />
      <Stack display="flex" flexDirection="row" sx={{pt:'5px', pb:'5px'}}>
        <Avatar sx={{ width: "80px", height: "80px" }} />
        <Box display="flex" flexDirection="column" justifyContent="center">
          <Typography level="body-lg">Player Name</Typography>
          <Typography level="body-sm">Rank Placeholder</Typography>
        </Box>
      </Stack>
      <Divider />
    </>
  );
}
