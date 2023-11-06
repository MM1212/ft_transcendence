import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { MessageProps } from '../types';
import FileImportIcon from '@components/icons/FileImportIcon';
import HeartIcon from '@components/icons/HeartIcon';
import PartyPopperIcon from '@components/icons/PartyPopperIcon';
import ChatsModel from '@typings/models/chat';
import { useRecoilValue } from 'recoil';
import chatsState from '../state';
import { sessionAtom, usersAtom } from '@hooks/user/state';
import AvatarWithStatus from './AvatarWithStatus';
import Moment from 'react-moment';
import moment from 'moment';

type ChatBubbleProps = {
  message: ChatsModel.Models.IChatMessage;
  messageId: number;
  chatId: number;
  features: {prev: boolean, next: boolean}
};
export default function ChatBubble({
  chatId,
  message: messageData,
  messageId,
  features // message: messageData, // messageIdx,
}: ChatBubbleProps) {
  const { authorId, createdAt, message, type, meta } =
    messageData; /* useRecoilValue(chatsState.message({ chatId, messageId }))! */
  const author = useRecoilValue(
    chatsState.participant({ chatId, participantId: authorId })
  )!;
  const user = useRecoilValue(usersAtom(author.userId))!;
  const self = useRecoilValue(sessionAtom);
  const isSent = self?.id === user?.id;
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [isCelebrated, setIsCelebrated] = React.useState<boolean>(false);
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
            online={user.online}
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
              <Typography level="body-xs">
                {moment(createdAt).fromNow()}
              </Typography>
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
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Sheet
                color={isSent ? 'primary' : 'neutral'}
                variant={isSent ? 'solid' : 'soft'}
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
                    ? 'var(--joy-palette-primary-solidBg)'
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
                  }}
                >
                  {message}
                </Typography>
              </Sheet>
              {(isHovered || isLiked || isCelebrated) && (
                <Stack
                  direction="row"
                  justifyContent={isSent ? 'flex-end' : 'flex-start'}
                  spacing={0.5}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    p: 1.5,
                    ...(isSent
                      ? {
                          left: 0,
                          transform: 'translate(-100%, -50%)',
                        }
                      : {
                          right: 0,
                          transform: 'translate(100%, -50%)',
                        }),
                  }}
                >
                  <IconButton
                    variant={isLiked ? 'soft' : 'plain'}
                    color={isLiked ? 'danger' : 'neutral'}
                    size="sm"
                    onClick={() => setIsLiked((prevState) => !prevState)}
                  >
                    {isLiked ? '❤️' : <HeartIcon />}
                  </IconButton>

                  <IconButton
                    variant={isCelebrated ? 'soft' : 'plain'}
                    color={isCelebrated ? 'warning' : 'neutral'}
                    size="sm"
                    onClick={() => setIsCelebrated((prevState) => !prevState)}
                  >
                    {isCelebrated ? '🎉' : <PartyPopperIcon />}
                  </IconButton>
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    ),
    [
      createdAt,
      features.next,
      features.prev,
      isCelebrated,
      isHovered,
      isLiked,
      isSent,
      message,
      type,
      user.avatar,
      user.nickname,
      user.online,
    ]
  );
}
