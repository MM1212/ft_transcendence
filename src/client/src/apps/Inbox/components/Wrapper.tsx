import { Box, styled } from '@mui/joy';

export const NotificationWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'read',
})<{
  read: boolean;
}>(({ theme, read }) => ({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.radius.md,
  position: 'relative',
  border: `1px solid ${theme.palette.divider}`,
  transition: theme.transitions.create('background-color'),
  backgroundColor: read ? undefined : theme.palette.background.level1,
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: 'background.level1',
  },
  textDecoration: 'none',
}));
