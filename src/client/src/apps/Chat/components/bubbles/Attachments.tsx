import { Box, Stack, styled } from '@mui/joy';
import ChatsModel from '@typings/models/chat';
import ChatDefaultMessageBubble, {
  ChatDefaultMessageBubbleProps,
} from './Default';
import { useImagePreviewActions } from '@apps/ImagePreview/hooks';
import React from 'react';
import { urlRegex } from '../NewChat';
import BugIcon from '@components/icons/BugIcon';

interface IChatEmbedAttachmentsBubbleProps
  extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.Media;
}

const ClickableImage = styled('img')({
  '&:hover': {
    cursor: 'pointer',
  },
});

function Attachment({ url }: { url: string }) {
  const { open } = useImagePreviewActions();
  const [isImage, setIsImage] = React.useState(false);
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => setIsImage(true);
    img.src = url;

    return () => {
      img.onload = null;
    };
  }, [url]);
  return isImage ? (
    <ClickableImage src={url} alt="embed" onClick={() => open({ src: url })} />
  ) : (
    <Box display="flex" justifyContent="center" alignItems="center">
      <BugIcon size="lg" />
    </Box>
  );
}

export default function ChatEmbedAttachmentsBubble({
  embed,
  ...props
}: IChatEmbedAttachmentsBubbleProps): JSX.Element {
  const showDefaultBubble = React.useMemo(
    () =>
      props.message.replace(new RegExp(urlRegex, 'g'), '').trim().length > 0,
    [props.message]
  );
  return (
    <Stack spacing={0.5}>
      {showDefaultBubble && <ChatDefaultMessageBubble {...props} />}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: props.isSent ? 'flex-end' : 'flex-start',
          flexWrap: 'wrap',
          gap: 0.5,
          '& > *': {
            flex: '1 0 10dvh',
            flexGrow: 0,
            aspectRatio: '1/1',
            objectFit: 'cover',
            borderRadius: 'md',
            width: showDefaultBubble ? '10dvh' : '14dvh',
            border: '2px solid',
            borderColor: 'divider',
          },
        }}
      >
        {embed.urls.map((url, index) => (
          <Attachment key={index} url={url} />
        ))}
      </Box>
    </Stack>
  );
}
