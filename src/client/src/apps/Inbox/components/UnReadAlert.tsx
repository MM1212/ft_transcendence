import CircleIcon from '@components/icons/CircleIcon';
import { styled } from '@mui/joy';

export const UnReadAlert = styled(CircleIcon)(({ theme }) => ({
  fontSize: theme.spacing(1),
  color: theme.palette.primary.plainColor,
  position: 'absolute',
  top: theme.spacing(0.75),
  left: theme.spacing(0.75),
}));
