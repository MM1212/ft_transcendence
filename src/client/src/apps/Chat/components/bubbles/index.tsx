import ChatsModel from '@typings/models/chat';
import ChatDefaultMessageBubble, { ChatDefaultMessageBubbleProps } from './Default';
import React from 'react';
import ChatEmbedAttachmentsBubble from './Attachments';
import ChatEmbedChatInviteBubble from './ChatInvite';

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
      case EmbedTypes.ChatInvite:
        return <ChatEmbedChatInviteBubble {...props} embed={embed} />;
      default:
        return <ChatDefaultMessageBubble {...props} />;
    }
  }, [embed, props]);
}
