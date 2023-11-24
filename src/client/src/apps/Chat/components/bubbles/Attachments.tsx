import { Box, Stack, styled } from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import ChatDefaultMessageBubble, {
  ChatDefaultMessageBubbleProps,
} from './Default';
import { useImagePreviewActions } from '@apps/ImagePreview/hooks';

interface IChatEmbedAttachmentsBubbleProps
  extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.Media;
}

const ClickableImage = styled('img')({
  '&:hover': {
    cursor: 'pointer',
  },
});

export default function ChatEmbedAttachmentsBubble({
  embed,
  ...props
}: IChatEmbedAttachmentsBubbleProps): JSX.Element {
  const { open } = useImagePreviewActions();
  return (
    <Stack spacing={0.5}>
      <ChatDefaultMessageBubble {...props} />
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: props.isSent ? 'flex-end' : 'flex-start',
          flexWrap: 'wrap',
          gap: 0.5,
          '& img': {
            flex: '1 0 10dvh',
            flexGrow: 0,
            aspectRatio: '1/1',
            objectFit: 'cover',
            borderRadius: 'md',
            maxWidth: '10dvh',
            border: '2px solid',
            borderColor: 'divider'
          },
        }}
      >
        {embed.urls.map((url, index) => (
          <ClickableImage
            key={index}
            src={url}
            alt="embed"
            onClick={() => open({ src: url })}
          />
        ))}
      </Box>
    </Stack>
  );
}
