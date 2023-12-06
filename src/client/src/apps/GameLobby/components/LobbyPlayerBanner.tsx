import { UserAvatar } from "@components/AvatarWithStatus";
import PlusIcon from "@components/icons/PlusIcon";
import { useUser } from "@hooks/user";
import { IconButton } from "@mui/joy";
import { Typography } from "@mui/joy";
import publicPath from "@utils/public";

export default function LobbyPlayerBanner({ id }: { id: number }) {
  const handleInviteFriend = () => {};
  const user = useUser(id);
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
      {id === 0 ? (
        <IconButton
          onClick={handleInviteFriend}
          color="neutral"
          variant="plain"
          size="lg"
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
            position: "absolute",
            marginTop: "7dvh",
            zIndex: 1,
            "&:hover": {
              backgroundColor: "unset",
            },
          })}
        >
          <UserAvatar
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
              position: "absolute",
              marginTop: "7dvh",
              zIndex: 1,
 
            })}
            color="warning"
            variant="outlined"
          >
            <PlusIcon
              sx={{ width: 35, height: 35,    
                "&:hover": {
                color: "warning",
                },}}
            />
          </UserAvatar>
        </IconButton>
      ) : (
        <>
          <UserAvatar
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
              position: "absolute",
              marginTop: "7dvh",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "",
              },
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
