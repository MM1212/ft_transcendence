import AccountRemoveIcon from "@components/icons/AccountRemoveIcon";
import { Avatar, Divider, IconButton, Stack, Tooltip } from "@mui/joy";
import { Typography } from "@mui/joy";
import { Sheet } from "@mui/joy";
import { samplePendingFriends } from "@views/lobby/hardoceTestes";

export default function BlockFriendsGetter() {
  const getBlockedFriends = () => {
    return "BLOCKED - " + samplePendingFriends.length;
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
        {getBlockedFriends()}
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
                  Blocked
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems={"center"} ml="auto">
              <Tooltip title="Unblock">
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
                  <AccountRemoveIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Sheet>
  );
}
