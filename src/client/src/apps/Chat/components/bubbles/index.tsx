import ChatsModel from '@typings/models/chat';
import { ChatDefaultMessageBubbleProps } from './Default';
import React from 'react';
import ChatEmbedAttachmentsBubble from './Attachments';

interface IChatEmbedMessageProps extends ChatDefaultMessageBubbleProps {
  embed: ChatsModel.Models.Embeds.All;
}

const EmbedTypes = ChatsModel.Models.Embeds.Type;

export default function ChatEmbedMessage({
  embed,
  ...props
}: IChatEmbedMessageProps): JSX.Element {
  return React.useMemo(() => {
    switch (embed.type) {
      case EmbedTypes.Media:
        return <ChatEmbedAttachmentsBubble {...props} embed={embed} />;
      default:
        return <></>;
    }
  }, [embed, props]);
}
