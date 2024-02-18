import * as React from 'react';
import LinearProgress from '@mui/joy/LinearProgress';

export default function AchivementBar({ percentage }: { percentage: number }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  return (
    <LinearProgress
      determinate
      variant="soft"
      color="primary"
      size="sm"
      value={progress}
      sx={{
        border: 'none',
        '--LinearProgress-radius': '2dvh',
        '--LinearProgress-thickness': '.6dvh',
        '&::before': {
          backgroundColor: (theme) =>
            theme.getCssVar('palette-primary-plainColor'),
          transition: (theme) =>
            theme.transitions.create('inline-size', {
              easing: 'ease-out',
              duration: theme.transitions.duration.complex * 2,
            }),
        },
      }}
    ></LinearProgress>
  );
}
