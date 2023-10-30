import { Button, Typography } from "@mui/joy";

export default function FriendsAll() {
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
      <Typography>All</Typography>
    </Button>
  );
}
