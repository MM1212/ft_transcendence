import * as React from "react";
import LinearProgress from "@mui/joy/LinearProgress";

export default function AchivementBar( {quantity}  : {quantity : number}) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setProgress(70);
  }, []);

  return (
    <LinearProgress
      determinate
      variant="soft"
      color="primary"
      size="sm"
      value={quantity * 10}
      sx={{
        border: "none",
        "--LinearProgress-radius": "20px",
        "--LinearProgress-thickness": "6px",
        "&::before": {
          transition: (theme) =>
            theme.transitions.create("inline-size", {
              easing: "ease-out",
              duration: theme.transitions.duration.complex * 2,
            }),
        },
      }}
    ></LinearProgress>
  );
}
