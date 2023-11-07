import InfiniteScroll from '@components/InfiniteScroll';
import { CircularProgress, Container, Sheet, Typography } from '@mui/joy';
import React from 'react';

export default function InfiniteScrollSandbox() {
  const [hasMore, setHasMore] = React.useState(true);
  const [messages, setMessages] = React.useState<string[]>(() =>
    Array.from({ length: 100 }, (_, i) => `Message ${i}`)
  );
  const nextPage = React.useCallback(() => {
    setTimeout(() => {
      if (messages.length > 500) return setHasMore(false);
      setMessages((prev) => [
        ...prev,
        ...Array.from({ length: 100 }, (_, i) => `Message ${i + prev.length}`),
      ]);
    }, 1000);
  }, [messages.length, setMessages, setHasMore]);
  return (
    <Container maxWidth="sm" sx={{ height: '100dvh', position: 'relative' }}>
      <InfiniteScroll
        hasMore={hasMore}
        loader={
          <CircularProgress
            color="primary"
            sx={{
              position: 'absolute',
              margin: '0 auto',
              top: (theme) => theme.spacing(2),
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        }
        endMessage={
          <Sheet
            color="warning"
            variant="soft"
            sx={{
              p: 1,
              mx: 'auto',
              my: 1,
              borderRadius: (theme) => theme.radius.sm,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography level="h4">No more messages</Typography>
          </Sheet>
        }
        next={nextPage}
        inverse
      >
        {messages.map((message, i) => (
          <Typography level="h4" key={i}>
            {message}
          </Typography>
        ))}
      </InfiniteScroll>
    </Container>
  );
}
