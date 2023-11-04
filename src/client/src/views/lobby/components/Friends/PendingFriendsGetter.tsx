import { Avatar, IconButton, Sheet, Typography } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack } from "@mui/joy";
import { alpha } from "@theme";
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
              <IconButton
                color="neutral"
                variant="soft"
                sx={{
                  borderRadius: (theme) => theme.radius.lg,
                  backgroundColor: (theme) =>
                    alpha(theme.resolveVar("palette-background-level2"), 0.75),
                }}
              >
                +
              </IconButton>
              <IconButton
                color="danger"
                sx={{
                  borderRadius: (theme) => theme.radius.lg,
                }}
              >
                -
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Sheet>
  );
}
