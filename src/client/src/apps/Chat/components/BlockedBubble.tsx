import * as React from 'react';
import Box from '@mui/joy/Box';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Button } from '@mui/joy';

interface BlockedBubbleProps {
  isSent: boolean;
  setShowAnyway: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function BlockedBubble({
  isSent,
  setShowAnyway,
}: BlockedBubbleProps) {
  return React.useMemo(
    () => (
      <Stack direction={isSent ? 'row-reverse' : 'row'} spacing={2}>
        <Box sx={{ maxWidth: '60%', minWidth: 'auto' }}>
          <Stack
            direction="row"
            justifyContent={isSent ? 'flex-end' : 'flex-start'}
            spacing={2}
            sx={{ mb: 0.25 }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isSent ? 'flex-end' : 'flex-start',
              }}
            >
              <Sheet
                variant={isSent ? 'solid' : 'soft'}
                sx={{
                  p: 1.25,
                  borderRadius: 'lg',
                  backgroundColor: isSent
                    ? 'primary.solidBg'
                    : 'background.body',
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: 'fit-content',
                  minWidth: '8dvh',
                  gap: (theme) => theme.spacing(1),
                }}
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
                  This message was blocked.
                </Typography>
                <Button
                  variant="plain"
                  color="neutral"
                  size="sm"
                  onClick={() => setShowAnyway(true)}
                >
                  Show anyway
                </Button>
              </Sheet>
            </Box>
          </Stack>
        </Box>
      </Stack>
    ),
    [isSent, setShowAnyway]
  );
}
