import { useSession } from "@hooks/user";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import UserAchievements from "./UserAchievements";
import UserMatchHistory from "./UserMatchHistory";
import { alpha } from "@theme";

export default function Profile() {
  const { user } = useSession();
  return (
    <>
      <Sheet
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
          height: "calc(100dvh - var(--Header-height))",
          overflowY: "auto",
          backgroundColor: "background.level1",
          width: "45dvh",
        }}
      >
        <Stack direction="column" justifyContent="center" alignItems="center">
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            width="100%"
            position="relative"
            p={1}
            spacing={0.5}
          >
            <Badge
              badgeInset="14%"
              color="neutral"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              size="lg"
            >
              <Avatar
                alt="Me"
                size="lg"
                src={user?.avatar}
                sx={(theme) => ({
                  width: theme.spacing(17),
                  height: theme.spacing(17),
                })}
              />
            </Badge>
            <Typography level="h2">{user?.nickname}</Typography>
            <ButtonGroup size="sm" variant="outlined">
              <Button size="sm">Message</Button>
              <Button size="sm">Friend Request</Button>
              <IconButton>...</IconButton>
            </ButtonGroup>
          </Stack>
          <Divider />
          <UserAchievements />
          <Divider />
          <UserMatchHistory />
        </Stack>
      </Sheet>
    </>
  );
}
