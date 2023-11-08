import * as React from "react";
import LinearProgress from "@mui/joy/LinearProgress";
// import { useCountUp } from "use-count-up";

export default function AchivementBar() {
  //   const { value } = useCountUp({
  //     isCounting: true,
  //     duration: 5,
  //     easing: "linear",
  //     start: 0,
  //     end: 70,
  //     onComplete: () => ({
  //       shouldRepeat: false,
  //       delay: 0.05,
  //     }),
  //   });

  return (
    <LinearProgress
      determinate
      variant="soft"
      color="primary"
      size="sm"
      value={Number(70)}
      sx={{
        border: "none",
        "--LinearProgress-radius": "20px",
        "--LinearProgress-thickness": "6px",
      }}
    ></LinearProgress>
  );
}
