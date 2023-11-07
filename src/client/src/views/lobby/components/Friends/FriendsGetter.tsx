import { Divider, IconButton, Typography } from "@mui/joy";
import { Sheet, Stack } from "@mui/joy";
import { sampleUsers } from "@views/lobby/hardoceTestes";
import AvatarWithStatus from "../AvatarWithStatusProps";
import { alpha } from "@theme";

export default function FriendsGetter({ type }: { type: string }) {
  console.log("type: " + type);
  const getOnlineFriends = () => {
    if (type === "all") {
      return "ALL FRIENDS - " + sampleUsers.length;
    }
    return "ONLINE - " + sampleUsers.filter((user) => user.online).length;
  };
  const sortedChats = sampleUsers.sort((a, b) => (a.online ? -1 : 1));

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
        {getOnlineFriends()}
      </Typography>
      <Divider />
      <Stack p={1} spacing={1} justifyContent="flex-end">
        {sortedChats.map((user) => {
          if ((type === "online" && user.online) || type === "all") {
            return (
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
                  <AvatarWithStatus
                    online={user.online}
                    src={user.avatar}
                    size="lg"
                  />
                  <Stack>
                    <Typography level="title-lg">{user.nickname}</Typography>
                    <Typography>
                      {user.online ? "Online" : "Offline"}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  ml="auto"
                >
                  <IconButton
                    color="neutral"
                    variant="soft"
                    sx={{
                      borderRadius: (theme) => theme.radius.lg,
                      backgroundColor: (theme) =>
                        alpha(
                          theme.resolveVar("palette-background-level2"),
                          0.75
                        ),
                    }}
                  >
                    A
                  </IconButton>
                  <IconButton color="neutral">B</IconButton>
                </Stack>
              </Stack>
            );
          }
          return null;
        })}
      </Stack>
    </Sheet>
  );
}
