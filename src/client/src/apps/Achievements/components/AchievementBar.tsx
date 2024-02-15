import * as React from "react";
import LinearProgress from "@mui/joy/LinearProgress";
import { useUser } from "@hooks/user/index";
import UsersModel from "@typings/models/users/index";



export default function AchivementBar({user}: {user: UsersModel.Models.IUserInfo}) {
  const [progress, setProgress] = React.useState(0);
  const currentUser = useUser(user.id);
  let achievements = currentUser?.achievements;
  if(!achievements) achievements = 0;
  const percentage = (achievements / 12) * 100;

  React.useEffect(() => {
    setProgress(percentage);
  }, []);

  return (
    <LinearProgress
      determinate
      variant="soft"
      color="primary"
      size="sm"
      value={progress}
      sx={{
        border: "none",
        "--LinearProgress-radius": "2dvh",
        "--LinearProgress-thickness": ".6dvh",
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
