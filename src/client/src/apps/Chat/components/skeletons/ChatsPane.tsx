import React from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, CircularProgress, IconButton, Tooltip } from '@mui/joy';
import PlaylistEditIcon from '@components/icons/PlaylistEditIcon';
import ChatsInput from '../ChatsInput';

export default function SkeletonChatsPane() {
  return React.useMemo(
    () => (
      <Sheet
        sx={{
          borderRight: '1px solid',
          borderLeft: '1px solid',
          borderColor: 'divider',
          height: '100%',
          overflowY: 'auto',
          width: '35dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          p={2}
          width="100%"
          pb={1.5}
        >
          <Typography
            fontSize={{ xs: 'md', md: 'lg' }}
            component="h1"
            fontWeight="lg"
            endDecorator={
              <Chip
                variant="soft"
                color="primary"
                size="md"
                slotProps={{ root: { component: 'span' } }}
              >
                ..
              </Chip>
            }
            sx={{ mr: 'auto' }}
          >
            Messages
          </Typography>

          <Tooltip title="New Group Chat" placement="left">
            <IconButton
              variant="plain"
              aria-label="edit"
              color="neutral"
              size="sm"
              sx={{ display: { xs: 'none', sm: 'unset' } }}
              disabled
            >
              <PlaylistEditIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Box sx={{ px: 2, pb: 1.5, width: '100%' }}>
          <ChatsInput disabled />
        </Box>
        <Box
          style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Sheet>
    ),
    []
  );
}
