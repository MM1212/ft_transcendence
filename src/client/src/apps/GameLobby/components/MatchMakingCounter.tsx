import * as React from "react";
import Box from "@mui/joy/Box";
import CircularProgress from "@mui/joy/CircularProgress";
import { IconButton } from "@mui/joy";
import CloseIcon from "@components/icons/CloseIcon";

export default function MatchMakingCounter({ stop }: { stop: () => void }) {
  const [progress, setProgress] = React.useState(0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress >= 600 ? 0 : prevProgress + 1
      );
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const formattedTime = formatTime(progress);

  const [hovered, setHovered] = React.useState(false);
  return (
    <Box
      sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}
    >
      <CircularProgress
        sx={{
          "--CircularProgress-circulation":
            "1.2s linear 0s infinite normal none running",
        }}
        variant={"plain"}
        color="warning"
        size="lg"
        thickness={3}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <IconButton
            sx={{
              mt: 0.5,
              "&:hover": {
                backgroundColor: "unset",
              },
            }}
            color="warning"
            onClick={stop}
          >
            <CloseIcon />
          </IconButton>
        ) : (
          formattedTime
        )}
      </CircularProgress>
    </Box>
  );
}
