import { useSelectedChat } from '@apps/Chat/hooks/useChat';
import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';
import useFriend from '@apps/Friends/hooks/useFriend';
import AvatarWithStatus from '@components/AvatarWithStatus';
import AccountIcon from '@components/icons/AccountIcon';
import CrownIcon from '@components/icons/CrownIcon';
import MessageIcon from '@components/icons/MessageIcon';
import ShieldIcon from '@components/icons/ShieldIcon';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import { useModal, useModalActions } from '@hooks/useModal';
import {
  Chip,
  ColorPaletteProp,
  Divider,
  IconButton,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import moment from 'moment';
import React from 'react';
import ChatManageMember from './ChatManageMember';

interface BadgeData {
  color: ColorPaletteProp;
  icon: React.ComponentType;
  tooltip: React.ReactNode;
}

export interface ChatMemberProps {
  participant: ChatsModel.Models.IChatParticipant;
  user: UsersModel.Models.IUserInfo;
  manage: boolean;
  isSelf: boolean;
  selfRole: ChatsModel.Models.ChatParticipantRole;
}

const Roles = ChatsModel.Models.ChatParticipantRole;

function Member({
  participant,
  user,
  isSelf,
  manage,
  selfRole,
}: ChatMemberProps): JSX.Element {
  const { close } = useModalActions('chat:members');
  const isMutedData = useSelectedChat().useIsParticipantMutedComputed(
    participant.id
  );

  const isBanned = participant.role === Roles.Banned;
  const left = participant.role === Roles.Left;

  const badges = React.useMemo<BadgeData[]>(() => {
    const arr: BadgeData[] = [];
    switch (participant.role) {
      case Roles.Owner:
        arr.push({
          color: 'warning',
          icon: CrownIcon,
          tooltip: 'Owner',
        });
        break;
      case Roles.Admin:
        arr.push({
          color: 'primary',
          icon: ShieldIcon,
          tooltip: 'OP',
        });
        break;
    }
    if (isMutedData.is) {
      arr.push({
        color: 'danger',
        icon: TimelapseIcon,
        tooltip: `Muted until ${
          isMutedData.type === 'permanent'
            ? 'forever'
            : moment(isMutedData.until).format('lll')
        }`,
      });
    }
    return arr;
  }, [isMutedData, participant.role]);

  const { goToProfile, goToMessages } = useFriend(user.id);

  const closeAndRun = React.useCallback(
    (cb: () => void) => () => {
      close();
      cb();
    },
    [close]
  );
  return (
    <Sheet
      sx={{
        borderRadius: 'sm',
      }}
      color={isBanned ? 'danger' : left ? 'neutral' : undefined}
      variant={isBanned || left ? 'soft' : undefined}
      component={Stack}
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      p={1}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <AvatarWithStatus status={user.status} src={user.avatar} size="lg" />
        <Stack spacing={0.1} height="100%" justifyContent="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              level="title-sm"
              sx={{
                color: isBanned
                  ? 'danger.mainChannel'
                  : left
                    ? 'neutral.mainChannel'
                    : undefined,
              }}
            >
              {user.nickname}
            </Typography>
            {badges.map(({ color, icon: Icon, tooltip }, i) => (
              <Tooltip size="sm" title={tooltip} key={i}>
                <Chip color={color} size="sm">
                  <Icon />
                </Chip>
              </Tooltip>
            ))}
          </Stack>
          <Typography level="body-xs" color="neutral">
            joined: {moment(participant.createdAt).format('ll')}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="View Profile">
          <IconButton
            size="sm"
            sx={{
              borderRadius: 'md',
            }}
            variant={isBanned || left ? 'soft' : undefined}
            color={isBanned ? 'danger' : left ? 'neutral' : undefined}
            onClick={closeAndRun(goToProfile)}
          >
            <AccountIcon />
          </IconButton>
        </Tooltip>
        {manage ? (
          <ChatManageMember
            closeAndRun={closeAndRun}
            participant={participant}
            user={user}
            role={selfRole}
            disabled={isSelf}
            variant={isBanned || left ? 'soft' : undefined}
            color={isBanned ? 'danger' : left ? 'neutral' : undefined}
          />
        ) : (
          <IconButton
            size="sm"
            sx={{
              borderRadius: 'md',
            }}
            variant={isBanned || left ? 'soft' : undefined}
            color={isBanned ? 'danger' : left ? 'neutral' : undefined}
            disabled={isSelf}
            onClick={closeAndRun(goToMessages)}
          >
            <MessageIcon />
          </IconButton>
        )}
      </Stack>
    </Sheet>
  );
}
function MembersList({
  manage = false,
  list,
}: {
  manage?: boolean;
  list: Omit<ChatMemberProps, 'manage' | 'isSelf' | 'selfRole'>[];
}): JSX.Element {
  const self = useSelectedChat().useSelfParticipant();
  return React.useMemo(
    () => (
      <Stack
        spacing={0.1}
        sx={{
          width: '50dvh',
          height: '30dvh',
          overflow: 'auto',
          gap: (theme) => theme.spacing(0.5),
        }}
      >
        {list.map(({ participant, user }) => (
          <Member
            participant={participant}
            user={user}
            manage={manage}
            key={participant.id}
            isSelf={self.id === participant.id}
            selfRole={self.role as ChatsModel.Models.ChatParticipantRole}
          />
        ))}
      </Stack>
    ),
    [list, manage, self.id, self.role]
  );
}

function MembersTab({ manage = false }: { manage?: boolean }): JSX.Element {
  const data = useChatManageActions().useParticipantsData();
  const members = React.useMemo(() => {
    return data
      .filter((d) => {
        switch (d.participant.role) {
          case Roles.Owner:
          case Roles.Admin:
          case Roles.Member:
            return true;
          default:
            return false;
        }
      })
      .sort((a, b) => {
       const aRole = a.participant.role;
        const bRole = b.participant.role;
        if (aRole === Roles.Owner) return -1;
        if (bRole === Roles.Owner) return 1;
        if (aRole === Roles.Admin && bRole !== Roles.Admin) return -1;
        if (bRole === Roles.Admin && aRole !== Roles.Admin) return 1;
        return a.participant.createdAt - b.participant.createdAt;
      });
  }, [data]);

  const banned = React.useMemo(() => {
    return data.filter((d) => d.participant.role === Roles.Banned);
  }, [data]);
  const left = React.useMemo(() => {
    return data.filter((d) => d.participant.role === Roles.Left);
  }, [data]);

  return (
    <Tabs size="sm" defaultValue={0}>
      <TabList tabFlex="auto" disableUnderline sx={{ gap: 1 }}>
        {manage && (
          <>
            <Tab value={0} disableIndicator sx={{ borderRadius: 'sm' }}>
              Members
            </Tab>
            <Tab value={1} disableIndicator sx={{ borderRadius: 'sm' }}>
              Banned
            </Tab>
            <Tab value={2} disableIndicator sx={{ borderRadius: 'sm' }}>
              Left
            </Tab>
          </>
        )}
      </TabList>
      <TabPanel value={0} sx={{ px: 0 }}>
        <MembersList list={members} manage={manage} />
      </TabPanel>
      <TabPanel value={1} sx={{ px: 0 }}>
        <MembersList list={banned} manage={manage} />
      </TabPanel>
      <TabPanel value={2} sx={{ px: 0 }}>
        <MembersList list={left} manage={manage} />
      </TabPanel>
    </Tabs>
  );
}

export default function ChatMembersModal(): JSX.Element {
  const { close, data, isOpened } = useModal<{ manage: boolean }>(
    'chat:members'
  );

  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog maxWidth="xl">
        <ModalClose />
        <Typography level="title-lg">Members</Typography>
        <Divider />

        <React.Suspense fallback={<div>Loading...</div>}>
          <MembersTab {...data} />
        </React.Suspense>
      </ModalDialog>
    </Modal>
  );
}
