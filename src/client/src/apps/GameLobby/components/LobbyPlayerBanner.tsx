import { UserAvatar } from "@components/AvatarWithStatus";
import PlusIcon from "@components/icons/PlusIcon";
import { useUser } from "@hooks/user";
import { Box } from "@mui/joy";
import { Typography } from "@mui/joy";
import { ChangePower } from "./PlayerSettingsModals/ChangePower";

export default function LobbyPlayerBanner({ id }: { id: number | undefined }) {
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
            // onClick={handleInvite}
            sx={{
              width: 35,
              height: 35,
            }}
          />
        </UserAvatar>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "37vh",
              height: "41dvh",
              clipPath: "polygon(50% 90%, 76% 80%, 76% 0, 24% 0, 24% 80%)",
              backgroundColor: "background.surface",
            }}
          >
            <Box
              sx={{
                display: "flex",
                mt: "0.5dvh",
                alignItems: "center",
                flexDirection: "column",
                pb: '20%',
                pt: 2,
                width: "35vh",
                height: "40dvh",
                justifyContent: "space-between",
                clipPath: "polygon(50% 90%, 76% 80%, 76% 0, 24% 0, 24% 80%)",
                backgroundColor: "background.level1",
              }}
            >
              <UserAvatar
                sx={(theme) => ({
                  width: theme.spacing(17),
                  height: theme.spacing(17),
                })}
                src={user?.avatar}
              />
              <Typography>{user?.nickname}</Typography>
              <ChangePower />
            </Box>
          </Box>
        </>
      )}
    </div>
  );
}
