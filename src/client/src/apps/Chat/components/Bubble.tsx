import { ColorPaletteProp, Sheet, styled } from '@mui/joy';

const Bubble = styled(Sheet, {
  shouldForwardProp: (prop) => prop !== 'isSent' && prop !== 'features' && prop !== 'messageId' && prop !== 'mainColor',
})<{
  isSent: boolean;
  features: { prev: boolean; next: boolean };
  mainColor?: ColorPaletteProp
}>(({ theme, isSent, features, mainColor = 'primary' }) => ({
  padding: theme.spacing(1.25),
  borderRadius: theme.radius.lg,
  borderTopRightRadius: isSent && features.prev ? theme.radius.xs : undefined,
  borderBottomRightRadius:
    isSent && features.next ? theme.radius.xs : undefined,
  borderTopLeftRadius: isSent || !features.prev ? undefined : theme.radius.xs,
  borderBottomLeftRadius:
    isSent || !features.next ? undefined : theme.radius.xs,
  backgroundColor: isSent
    ? theme.palette[mainColor].solidBg
    : theme.palette.background.body,
  display: 'flex',
  alignItems: 'center',
  justifyContent: isSent ? 'flex-end' : 'flex-start',
  width: '100%',
}));

export default Bubble;
