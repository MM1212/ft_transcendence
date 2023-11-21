import Button from '@mui/joy/Button';
import { useSession } from '@hooks/user';
import {
  Box,
  ButtonGroup,
  Container,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import Link from '@components/Link';

import { NotificationProps } from '@lib/notifications/hooks';
import notifications from '@lib/notifications/hooks';
import Logo from '@components/Logo';
import LoginModal from '../components/LoginModal';


export default function LoginPage() {
  return (
    <Box
      style={{
        width: '100dvw',
        height: '100dvh',
        backgroundImage: 'url(/loginPage.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <LoginModal />
    </Box>
  );
}
