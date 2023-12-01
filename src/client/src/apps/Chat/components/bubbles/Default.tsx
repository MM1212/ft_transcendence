import { Typography, VariantProp } from '@mui/joy';
import Bubble from '../Bubble';
import { urlRegex } from '../NewChat';
import React from 'react';

export interface ChatDefaultMessageBubbleProps {
  messageId: number;
  isSent: boolean;
  features: {
    prev: boolean;
    next: boolean;
  };
  message: string;
  variant: VariantProp;
}

export default function ChatDefaultMessageBubble({
  isSent,
  features,
  message,
  variant,
}: ChatDefaultMessageBubbleProps): JSX.Element {
  const messageFormatted = React.useMemo(() => {
    return message.replace(new RegExp(urlRegex, 'g'), (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }, [message]);
  return (
    <Bubble variant={variant} isSent={isSent} features={features}>
      <Typography
        level="text-sm"
        component="div"
        sx={{
          color: isSent
            ? 'var(--joy-palette-common-white)'
            : 'var(--joy-palette-text-primary)',
          width: 'fit-content',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          '& a': {
            color: 'var(--joy-palette-text-primary)',
            textDecoration: 'underline',
          },
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: messageFormatted,
          }}
        />
      </Typography>
    </Bubble>
  );
}
