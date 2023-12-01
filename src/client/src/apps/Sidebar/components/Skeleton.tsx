import { CircularProgress, Sheet } from '@mui/joy';
import React from 'react';

export default function SidebarRouteFallbackSkeleton(): JSX.Element {
  return React.useMemo(
    () => (
      <Sheet
        style={{
          height: '100%',
          width: '40dvh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Sheet>
    ),
    []
  );
}
