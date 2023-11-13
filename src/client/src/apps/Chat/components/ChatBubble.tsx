import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import ChatsModel from '@typings/models/chat';
import { useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import { sessionAtom, usersAtom } from '@hooks/user/state';
import AvatarWithStatus from '@components/AvatarWithStatus';
import moment from 'moment';
import { Tooltip } from '@mui/joy';

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
  const features = React.useMemo(
    () => ({
      prev: featuresPrev,
      next: featuresNext,
    }),
    [featuresNext, featuresPrev]
  );
  const {
    authorId,
    createdAt,
    message,
    type,
    pending,
  }: ChatsModel.Models.IChatMessage & { pending?: boolean } =
    messageData; /* useRecoilValue(chatsState.message({ chatId, messageId }))! */

  const author = useRecoilValue(
    chatsState.participant({ chatId, participantId: authorId })
  )!;
  const user = useRecoilValue(usersAtom(author.userId))!;
  const self = useRecoilValue(sessionAtom);
  const isSent = self?.id === user?.id;
  return React.useMemo(
    () => (
      <Stack
        direction={isSent ? 'row-reverse' : 'row'}
        spacing={2}
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
          />
        )}

        <Box sx={{ maxWidth: '60%', minWidth: 'auto' }}>
          <Stack
            direction="row"
            justifyContent={isSent ? 'flex-end' : 'flex-start'}
            spacing={2}
            sx={{ mb: 0.25 }}
          >
            {!isSent && !features.prev && (
              <Typography level="body-xs">{user.nickname}</Typography>
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
                <Typography level="body-xs">
                  {moment(createdAt).fromNow(true)}
                </Typography>
              </Tooltip>
            )}
          </Stack>
          {type === ChatsModel.Models.ChatMessageType.Embed ? (
            <Sheet
              variant="outlined"
              sx={(theme) => ({
                px: 1.75,
                py: 1.25,
                borderRadius: 'lg',
                borderTopRightRadius:
                  isSent && features.prev ? theme.radius.xs : undefined,
                borderBottomRightRadius:
                  isSent && features.next ? theme.radius.xs : undefined,
                borderTopLeftRadius:
                  isSent || !features.prev ? undefined : theme.radius.xs,
                borderBottomLeftRadius:
                  isSent || !features.next ? undefined : theme.radius.xs,
              })}
            >
              {/* <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar color="primary" size="lg">
              <FileImportIcon />
            </Avatar>
            <div>
              <Typography fontSize="sm">{attachment.fileName}</Typography>
              <Typography level="body-sm">{attachment.size}</Typography>
            </div>
          </Stack> */}
            </Sheet>
          ) : (
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
              }}
            >
              <Sheet
                variant={isSent && !pending ? 'solid' : 'soft'}
                sx={(theme) => ({
                  p: 1.25,
                  borderRadius: 'lg',
                  borderTopRightRadius:
                    isSent && features.prev ? theme.radius.xs : undefined,
                  borderBottomRightRadius:
                    isSent && features.next ? theme.radius.xs : undefined,
                  borderTopLeftRadius:
                    isSent || !features.prev ? undefined : theme.radius.xs,
                  borderBottomLeftRadius:
                    isSent || !features.next ? undefined : theme.radius.xs,
                  backgroundColor: isSent
                    ? theme.getCssVar(
                        !pending
                          ? 'palette-primary-solidBg'
                          : 'palette-primary-softBg'
                      )
                    : 'background.body',
                  display: 'flex',
                  alignItems: 'center',
                  // justifyContent: isSent ? 'flex-end' : 'flex-start',
                  maxWidth: 'fit-content',
                  minWidth: '8dvh',
                })}
              >
                <Typography
                  level="body-sm"
                  component="span"
                  sx={{
                    color: isSent
                      ? 'var(--joy-palette-common-white)'
                      : 'var(--joy-palette-text-primary)',
                    width: 'fit-content',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {message}
                </Typography>
              </Sheet>
            </Box>
          )}
        </Box>
      </Stack>
    ),
    [
      createdAt,
      features.next,
      features.prev,
      isSent,
      message,
      pending,
      type,
      user.avatar,
      user.nickname,
      user.status,
    ]
  );
}
