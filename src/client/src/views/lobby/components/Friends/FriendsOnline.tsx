import { Button, Typography } from "@mui/joy";
import { PropsWithChildren, ReactElement, useState } from "react";
import { Link, LinkProps } from "wouter";
import { BaseLocationHook, LocationHook, navigate } from "wouter/use-location";

export default function FriendsOnline() {
  // Lets make a function that handles the button click
  console.log("FriendsOnline");
  const [selected, setSelected] = useState(false);
  const handleClick = () => {
    setSelected(true);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        color="neutral"
        variant="outlined"
        size="sm"
        sx={{
          border: "none",
          display: { xs: "none", md: "inline-flex" },
        }}
      >
        <Typography>Online</Typography>
      </Button>
    </>
  );
}
