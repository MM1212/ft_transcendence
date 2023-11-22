import { useSelectedChat } from '@apps/Chat/hooks/useChat';
import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';
import AvatarWithStatus from '@components/AvatarWithStatus';
import CloseOctagonOutlineIcon from '@components/icons/CloseOctagonOutlineIcon';
import CrownIcon from '@components/icons/CrownIcon';
import GavelIcon from '@components/icons/GavelIcon';
import HammerSickleIcon from '@components/icons/HammerSickleIcon';
import ShieldIcon from '@components/icons/ShieldIcon';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import { useModal } from '@hooks/useModal';
import {
  Chip,
  ColorPaletteProp,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import moment from 'moment';
import React from 'react';

interface BadgeData {
  color: ColorPaletteProp;
  icon: React.ComponentType;
  tooltip: React.ReactNode;
}

const Roles = ChatsModel.Models.ChatParticipantRole;

function Member({
  participant,
  user,
}: {
  participant: ChatsModel.Models.IChatParticipant;
  user: UsersModel.Models.IUserInfo;
  manage: boolean;
}): JSX.Element {
  const isMutedData = useSelectedChat().useIsParticipantMutedComputed(
    participant.id
  );

  const isBanned =
  participant.role === Roles.Banned;

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
      case Roles.Banned:
        arr.push({
          color: 'warning',
          icon: CloseOctagonOutlineIcon,
          tooltip: 'Banned',
        })
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

 
  return (
    <ListItem
      key={participant.id}
      sx={{
        gap: 1,
        borderRadius: 'sm'
      }}
      color={isBanned ? 'danger' : undefined}
      variant={isBanned ? 'soft': undefined}
    >
      <ListItemDecorator>
        <AvatarWithStatus status={user.status} src={user.avatar} size="lg" />
      </ListItemDecorator>
      <ListItemContent>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography level="title-sm">{user.nickname}</Typography>
          {badges.map(({ color, icon: Icon, tooltip }, i) => (
            <Tooltip size="sm" title={tooltip} key={i}>
              <Chip color={color} size="sm">
                <Icon />
              </Chip>
            </Tooltip>
          ))}
        </Stack>
        <Typography level="body-xs" color="neutral">
          since: {moment(participant.createdAt).format('ll')}
        </Typography>
      </ListItemContent>
      <ListItemContent
        style={{
          width: 'fit-content',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography level="body-xs" color="neutral">
            {participant.id}
          </Typography>
        </Stack>
      </ListItemContent>
    </ListItem>
  );
}

function MembersList({ manage = false }: { manage?: boolean }): JSX.Element {
  const data = useChatManageActions().useParticipantsData();
  const filtered = React.useMemo(() => {
    return [...data].filter(d => d.participant.role !== Roles.Left).sort((a, b) => {
      if (a.participant.role === Roles.Owner) {
        return -1;
      }
      if (b.participant.role === Roles.Owner) {
        return 1;
      }
      if (a.participant.role === Roles.Admin) {
        return -1;
      }
      if (b.participant.role === Roles.Admin) {
        return 1;
      }
      if (a.participant.role === Roles.Member) {
        return -1;
      }
      if (b.participant.role === Roles.Member) {
        return 1;
      }
      return 0;
    });
  }, [data]);
  return (
    <List
      component="div"
      style={{
        width: '50dvh',
      }}
    >
      {filtered.map(({ participant, user }) => (
        <Member
          participant={participant}
          user={user}
          manage={manage}
          key={participant.id}
        />
      ))}
    </List>
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
        <React.Suspense fallback={<div>Loading...</div>}>
          <MembersList {...data} />
        </React.Suspense>
      </ModalDialog>
    </Modal>
  );
}
