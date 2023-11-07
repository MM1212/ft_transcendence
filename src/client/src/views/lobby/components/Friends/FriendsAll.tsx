import { listItemClasses } from "@mui/joy";
import { Button, Typography } from "@mui/joy";
import clsx from "clsx";
import { useRoute } from "wouter";

export default function FriendsAll() {
  const [selected] = useRoute("/All");
  return (
    <Button
      color="neutral"
      variant="outlined"
      size="sm"
      className={clsx(listItemClasses.root, {
        "Mui-selected": selected,
      })}
      sx={{
        border: "none",
        display: { xs: "none", md: "inline-flex" },
      }}
    >
      <Typography>All</Typography>
    </Button>
  );
}
