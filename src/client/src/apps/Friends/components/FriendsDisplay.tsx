import { Divider, IconButton, Typography } from "@mui/joy";
import { Sheet, Stack } from "@mui/joy";
import AvatarWithStatus from "@components/AvatarWithStatus";
import React from "react";
import { userStatusToString } from "@utils/userStatus";
import MessageIcon from "@components/icons/MessageIcon";
import { useUser } from "@hooks/user";
import FriendsOptionsMenu from "./FriendsOptionsMenu";
import useFriend from "../hooks/useFriend";
import ProfileTooltip from "@components/ProfileTooltip";
import GenericPlaceholder from "@components/GenericPlaceholder";
import TrophyBrokenIcon from "@components/icons/TrophyBrokenIcon";
import AccountGroupIcon from "@components/icons/AccountGroupIcon";

function FriendDisplay({ id }: { id: number }): JSX.Element | null {
  const user = useUser(id);
  const { goToMessages, goToProfile } = useFriend(id);
  if (!user) return null;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
      key={user.id}
      sx={{
        width: "100%",
        borderRadius: (theme) => theme.radius.sm,
        p: 1,
        transition: (theme) => theme.transitions.create("background-color", {}),
        "&:hover": {
          backgroundColor: "background.level1",
          cursor: "pointer",
        },
      }}
      onClick={goToProfile}
    >
      <Stack direction="row" spacing={1.5}>
        <ProfileTooltip user={user} placement="right-start">
          <AvatarWithStatus status={user.status} src={user.avatar} size="lg" />
        </ProfileTooltip>
        <Stack>
          <Typography level="title-md">{user.nickname}</Typography>
          <Typography level="body-sm">
            {userStatusToString(user.status)}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" ml="auto">
        <IconButton
          color="neutral"
          variant="soft"
          sx={{
            borderRadius: (theme) => theme.radius.xl,
          }}
          onClick={(e) => {
            e.stopPropagation();
            goToMessages();
          }}
        >
          <MessageIcon size="sm" />
        </IconButton>
        <FriendsOptionsMenu id={id} />
      </Stack>
    </Stack>
  );
}

export function FriendsDisplayWrapper({
  label,
  length,
  children,
}: React.PropsWithChildren<{
  label: React.ReactNode;
  length: number;
}>): JSX.Element {
  return (
    <Stack
      sx={{
        overflowY: "auto",
        height: '100%',
        alignItems:'flex-start'
      }}
    >
      <Typography
        fontWeight={"light"}
        textTransform="uppercase"
        fontSize={11}
        p={1}
      >
        {label} - {length}
      </Typography>
      <Divider />
      <Stack p={1.5} spacing={1} height='100%' width='100%' >
        {children}
      </Stack>
    </Stack>
  );
}

export default function FriendsDisplay({
  ids,
  label,
}: {
  ids: number[];
  label: React.ReactNode;
}) {
  return (
    <FriendsDisplayWrapper label={label} length={ids.length}>
      {ids.length > 0 ? (
        <>  
          {ids.map((id) => (
            <FriendDisplay id={id} key={id} />
          ))}
        </>
      ) : (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>
          <GenericPlaceholder
            title="Add Friends to Add to the List"
            icon={<AccountGroupIcon fontSize="xl4" />}
            path="/pong/play/queue"
          />
        </div>
      )}
    </FriendsDisplayWrapper>
  );
}
