import { Button, Typography } from "@mui/joy";

export default function AddFriend() {
  return (
    <Button
      variant="outlined"
      size="sm"
      sx={{
        border: "none",
		backgroundColor: "green",
        display: { xs: "none", md: "inline-flex" },
      }}
    >
      <Typography>Add Friend</Typography>
    </Button>
  );
}
// var(--joy-palette-neutral-100, #F0F4F8)
// var(--joy-palette-neutral-200, #DDE7EE)

