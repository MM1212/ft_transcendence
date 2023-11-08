import Avatar from "@mui/joy/Avatar";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { Badge } from "@mui/joy";
import { ChatModel } from "@typings/models";
import { useSession } from "@hooks/user";

type ChatHeader = {
  // sender: ChatModel.Models.IChatParticipant;
  chat: ChatModel.Models.IChat;
};

export default function MessagesPaneHeader({ chat }: ChatHeader) {
  const { user } = useSession();
  if (!user) return null;

  const whoIAmTalkingTo: ChatModel.Models.IChatParticipant | undefined =
    chat.participants.find((e) => e.user.id !== user.id);
  if (!whoIAmTalkingTo) return null;

  let src: string;
  if (chat.type === ChatModel.Models.ChatType.Group) {
    src = chat.photo || whoIAmTalkingTo.user.avatar; //Put default Image not this one
  } else src = whoIAmTalkingTo.user.avatar;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.level1",
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
        <Avatar size="lg" src={src} />
        <div>
          <Typography
            fontWeight="lg"
            fontSize="lg"
            component="h2"
            noWrap
            endDecorator={
              chat.participants[0].user.online ? (
                <Chip
                  variant="outlined"
                  size="sm"
                  color="neutral"
                  sx={{
                    borderRadius: "sm",
                    paddingLeft: "0.9rem",
                  }}
                  slotProps={{ root: { component: "span" } }}
                  startDecorator={
                    <Badge
                      sx={{
                        position: "absolute",
                        width: "0.1rem",
                        height: "0.1rem",
                      }}
                      badgeInset="1px 7px"
                      color="success"
                      variant="soft"
                    />
                  }
                >
                  Online
                </Chip>
              ) : undefined
            }
          >
            {/* {chat.participants[0].user.nickname} */}
            {whoIAmTalkingTo.user.nickname}
          </Typography>

          <Typography level="body-sm">
            {/* {chat.participants[0].user.nickname} */}
            {whoIAmTalkingTo.user.nickname}
          </Typography>
        </div>
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: "none", md: "inline-flex" },
          }}
        >
          Call
        </Button>
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: "none", md: "inline-flex" },
          }}
        >
          View profile
        </Button>
        <IconButton size="sm" variant="plain" color="neutral"></IconButton>
      </Stack>
    </Stack>
  );
}