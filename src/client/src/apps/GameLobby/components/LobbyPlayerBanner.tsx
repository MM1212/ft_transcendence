import { UserAvatar } from "@components/AvatarWithStatus";
import PlusIcon from "@components/icons/PlusIcon";
import { useUser } from "@hooks/user";
import { IconButton } from "@mui/joy";
import { Typography } from "@mui/joy";
import publicPath from "@utils/public";

export default function LobbyPlayerBanner({ id }: { id: number | undefined }) {
  const handleInviteFriend = () => {};
  const user = useUser(id!);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "3dvh",
        position: "relative",
      }}
    >
      {id === undefined ? (
        <UserAvatar
          onClick={handleInviteFriend}
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
            position: "absolute",
            marginTop: "7dvh",
            cursor: "pointer",
            zIndex: 1,
            transition: theme.transitions.create("background-color"),
            "&:hover": {
              bgcolor: "warning.softBg",
            },
          })}
          color="warning"
          variant="outlined"
        >
          <PlusIcon
            sx={{
              width: 35,
              height: 35,
            }}
          />
        </UserAvatar>
      ) : (
        <>
          <UserAvatar
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
              position: "absolute",
              marginTop: "7dvh",
              zIndex: 1,
            })}
            variant="outlined"
            src={user?.avatar}
          />
          <Typography
            textAlign="center"
            sx={{ position: "absolute", bottom: "50%" }}
          >
            {user?.nickname}
          </Typography>
          <img
            src={publicPath("/matchMaking/matchMakingFrame.webp")}
            alt="Matchmaking Frame"
            width="300"
            height="500"
          />
        </>
      )}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          bottom: "15%",
        }}
      ></div>
    </div>
  );
}
