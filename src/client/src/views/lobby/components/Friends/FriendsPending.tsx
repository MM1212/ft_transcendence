import { Button, Typography } from "@mui/joy";

export default function FriendsPending() {
  return (
    <Button
      color="neutral"
      variant="outlined"
      size="sm"
      sx={{
        border: "none",
        display: { xs: "none", md: "inline-flex" },
      }}
    >
      <Typography>Pending</Typography>
    </Button>
  );
}