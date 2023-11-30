import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import useChat from '../hooks/useChat';
import AvatarWithStatus from '@components/AvatarWithStatus';
import ProfileTooltip, {
  IProfileTooltipProps,
} from '@components/ProfileTooltip';
import CrownIcon from '@components/icons/CrownIcon';
import ShieldIcon from '@components/icons/ShieldIcon';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import { Tooltip, Chip, AvatarProps } from '@mui/joy';
import moment from 'moment';
import React from 'react';

export default function ChatAvatarWithTooltip({
  user,
  participant,
  hide = false,
  tooltipProps,
  ...rest
}: {
  user: UsersModel.Models.IUserInfo;
  participant: ChatsModel.Models.IChatParticipant;
  tooltipProps?: Partial<IProfileTooltipProps>;
  hide?: boolean;
} & AvatarProps): JSX.Element {
  const mutedData = useChat(participant.chatId).useIsParticipantMutedComputed(
    participant.id
  );
  const isMuted = mutedData.is;

  const badges = React.useMemo(
    () =>
      [
        isMuted && (
          <Tooltip
            title={`Muted until ${
              mutedData.type === 'permanent'
                ? 'forever'
                : moment(participant.mutedUntil).format('lll')
            }`}
          >
            <Chip color="danger" variant="plain" size="sm">
              <TimelapseIcon />
            </Chip>
          </Tooltip>
        ),
        participant.role === ChatsModel.Models.ChatParticipantRole.Admin ? (
          <Chip color="primary" variant="plain" size="sm">
            <ShieldIcon />
          </Chip>
        ) : participant.role === ChatsModel.Models.ChatParticipantRole.Owner ? (
          <Chip color="warning" variant="plain" size="sm">
            <CrownIcon />
          </Chip>
        ) : null,
      ].filter(Boolean) as JSX.Element[],
    [isMuted, mutedData, participant.mutedUntil, participant.role]
  );

  return React.useMemo(
    () => (
      <ProfileTooltip
        user={user}
        placement="right-start"
        badges={badges}
        {...tooltipProps}
      >
        <AvatarWithStatus
          status={user.status}
          src={user.avatar}
          hide={hide}
          muted={isMuted}
          size="md"
          background="level1"
          {...rest}
        />
      </ProfileTooltip>
    ),
    [user, badges, tooltipProps, hide, isMuted, rest]
  );
}
