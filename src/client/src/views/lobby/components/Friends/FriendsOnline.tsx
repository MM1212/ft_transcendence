import { Button, Typography } from "@mui/joy";
import { useState } from "react";
import { Link } from "wouter";

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
