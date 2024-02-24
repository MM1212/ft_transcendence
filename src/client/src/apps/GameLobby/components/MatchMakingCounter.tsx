import * as React from 'react';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import { IconButton } from '@mui/joy';
import CloseIcon from '@components/icons/CloseIcon';
import moment from 'moment';

export default function MatchMakingCounter({
  startedAt,
  stop,
}: {
  startedAt: number;
  stop: () => void;
}) {
  const [progress, setProgress] = React.useState(0);

  const formatTime = (seconds: number) => {
    return moment.utc(seconds).format('mm:ss');
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress(Date.now() - startedAt);
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, [startedAt]);
  const formattedTime = formatTime(progress);

  const [hovered, setHovered] = React.useState(false);
  return (
    <Box
      sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <CircularProgress
        sx={{
          '--CircularProgress-circulation':
            '1.2s linear 0s infinite normal none running',
        }}
        variant={'plain'}
        color="warning"
        size="lg"
        thickness={3}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? (
          <IconButton
            sx={{
              mt: 0.5,
              '&:hover': {
                backgroundColor: 'unset',
              },
            }}
            color="warning"
            onClick={stop}
          >
            <CloseIcon />
          </IconButton>
        ) : (
          formattedTime
        )}
      </CircularProgress>
    </Box>
  );
}
