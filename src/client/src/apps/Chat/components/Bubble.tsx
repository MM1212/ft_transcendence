import { Sheet, styled } from '@mui/joy';

const Bubble = styled(Sheet, {
  shouldForwardProp: (prop) => prop !== 'isSent' && prop !== 'features',
})<{
  isSent: boolean;
  features: { prev: boolean; next: boolean };
}>(({ theme, isSent, features }) => ({
  padding: theme.spacing(1.25),
  borderRadius: theme.radius.lg,
  borderTopRightRadius: isSent && features.prev ? theme.radius.xs : undefined,
  borderBottomRightRadius:
    isSent && features.next ? theme.radius.xs : undefined,
  borderTopLeftRadius: isSent || !features.prev ? undefined : theme.radius.xs,
  borderBottomLeftRadius:
    isSent || !features.next ? undefined : theme.radius.xs,
  backgroundColor: isSent
    ? theme.palette.primary.solidBg
    : theme.palette.background.body,
  display: 'flex',
  alignItems: 'center',
  justifyContent: isSent ? 'flex-end' : 'flex-start',
  maxWidth: 'fit-content',
  minWidth: '8dvh',
}));

export default Bubble;
