import { Typography, TypographyProps } from '@mui/joy';
import React from 'react';

const LobbyGameTypography = React.forwardRef<HTMLSpanElement, TypographyProps>(
  ({ children, ...props }, ref) => {
    return (
      <Typography
        component="div"
        variant="outlined"
        color="warning"
        sx={{ border: 'unset' }}
        {...props}
        ref={ref}
      >
        {children}
      </Typography>
    );
  }
);

export default LobbyGameTypography;
