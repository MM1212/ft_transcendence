import AccountMinusIcon from "@components/icons/AccountMinusIcon";
import AccountPlusIcon from "@components/icons/AccountPlusIcon";
import CheckAllIcon from "@components/icons/CheckAllIcon";
import CheckIcon from "@components/icons/CheckIcon";
import CloseIcon from "@components/icons/CloseIcon";
import { Avatar, IconButton, Sheet, Typography } from "@mui/joy";
import { Tooltip } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack } from "@mui/joy";
import { samplePendingFriends } from "@views/lobby/hardoceTestes";

export default function PendingFriendsGetter() {
  const getPendingRequests = () => {
    return "PENDING - " + samplePendingFriends.length;
  };
  return (
    <Sheet
      sx={{
        backgroundColor: "background.level1",
        overflowY: "auto",
      }}
    >
      <Typography
        fontWeight={"light"}
        fontSize={11}
        sx={{
          py: 1,
          px: 1,
        }}
      >
        {getPendingRequests()}
      </Typography>
      <Divider />
      <Stack p={1} spacing={1} justifyContent={"flex-end"}>
        {samplePendingFriends.map((user) => (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            key={user.id}
            sx={{
              width: "100%",
              backgroundColor: "background.level1",
              borderRadius: (theme) => theme.radius.sm,
              p: 1,
              "&:hover": {
                backgroundColor: "background.surface",
                cursor: "pointer",
                transition: (theme) =>
                  theme.transitions.create("background-color", {}),
              },
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <Avatar src={user.avatar} size="lg"></Avatar>
              <Stack>
                <Typography level="title-lg">{user.nickname}</Typography>
                <Typography fontWeight="light" fontSize={10}>
                  Incoming Friend Request
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems={"center"} ml="auto">
              <Tooltip title="Accept">
                <IconButton
                  color="neutral"
                  sx={(theme) => ({
                    "&:hover": {
                      color: theme.getCssVar("palette-success-400"),
                    },
                    borderRadius: theme.radius.lg,
                  })}
                >
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ignore">
                <IconButton
                  color="neutral"
                  sx={(theme) => ({
                    transition: theme.transitions.create("color", {
                      duration: theme.transitions.duration.shortest,
                    }),
                    "&:hover": {
                      color: theme.getCssVar("palette-danger-400"),
                    },
                    borderRadius: theme.radius.lg,
                  })}
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Sheet>
  );
}
