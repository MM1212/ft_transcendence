import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import ChatsModel from '@typings/models/chat';
import { useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import { sessionAtom, usersAtom } from '@hooks/user/state';
import AvatarWithStatus from '@components/AvatarWithStatus';
import moment from 'moment';
import { Tooltip } from '@mui/joy';
import useChat from '../hooks/useChat';
import BlockedBubble from './BlockedBubble';
import ChatDefaultMessageBubble from './bubbles/Default';
import ChatEmbedMessage from './bubbles';

type ChatBubbleProps = {
  message: ChatsModel.Models.IChatMessage;
  messageId: number;
  chatId: number;
  featuresPrev: boolean;
  featuresNext: boolean;
};

export default function ChatBubble({
  chatId,
  message: messageData,
  featuresNext,
  featuresPrev, // message: messageData, // messageIdx,
}: ChatBubbleProps) {
  const {
    authorId,
    createdAt,
    message,
    type,
    pending,
    meta,
    id,
  }: ChatsModel.Models.IChatMessage & { pending?: boolean } =
    messageData; /* useRecoilValue(chatsState.message({ chatId, messageId }))! */

  const author = useRecoilValue(
    chatsState.participant({ chatId, participantId: authorId })
  )!;
  const user = useRecoilValue(usersAtom(author.userId))!;
  const self = useRecoilValue(sessionAtom);
  const isSent = self?.id === user?.id;
  const { muted: isMuted, blocked: isBlocked } =
    useChat(chatId).useIsParticipantBlocked(authorId);
  const [showAnyway, setShowAnyway] = React.useState(false);
  const features = React.useMemo(
    () => ({
      prev: featuresPrev && !isBlocked,
      next: featuresNext && !isBlocked,
    }),
    [featuresNext, featuresPrev, isBlocked]
  );
  return React.useMemo(
    () =>
      isBlocked && !showAnyway ? (
        <BlockedBubble isSent={isSent} setShowAnyway={setShowAnyway} />
      ) : (
        <Stack
          direction={isSent ? 'row-reverse' : 'row'}
          spacing={1}
          sx={
            features.next
              ? {
                  mb: (theme) => `${theme.spacing(0.125)} !important`,
                }
              : undefined
          }
        >
          {!isSent && (
            <AvatarWithStatus
              status={user.status}
              src={user.avatar}
              hide={features.prev}
              muted={isMuted}
              size="md"
            />
          )}

          <Box sx={{ maxWidth: '60%', minWidth: '8dvh' }}>
            <Box
              display="flex"
              justifyContent="space-between"
              mb={0.25}
              pr={0.25}
              width="100%"
            >
              {!isSent && !features.prev && (
                <Typography level="body-xs" mr={2}>
                  {user.nickname}
                </Typography>
              )}
              {!features.prev && (
                <Tooltip
                  title={moment(createdAt).format(
                    'dddd, MMMM Do YYYY, h:mm:ss a'
                  )}
                  enterDelay={1000}
                  placement="top"
                  arrow
                >
                  <Typography level="body-xs" ml="auto !important">
                    {moment(createdAt).fromNow(true)}
                  </Typography>
                </Tooltip>
              )}
            </Box>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
              }}
            >
              {type === ChatsModel.Models.ChatMessageType.Normal ? (
                <ChatDefaultMessageBubble
                  messageId={id}
                  isSent={isSent}
                  features={features}
                  message={message}
                  variant={isSent && !pending ? 'solid' : 'soft'}
                />
              ) : (
                <ChatEmbedMessage
                  messageId={id}
                  isSent={isSent}
                  features={features}
                  message={message}
                  variant={isSent && !pending ? 'solid' : 'soft'}
                  embed={meta as ChatsModel.Models.Embeds.All}
                />
              )}
            </Box>
          </Box>
        </Stack>
      ),
    [
      isBlocked,
      showAnyway,
      isSent,
      features,
      user.status,
      user.avatar,
      user.nickname,
      isMuted,
      createdAt,
      type,
      id,
      message,
      pending,
      meta,
    ]
  );
}
