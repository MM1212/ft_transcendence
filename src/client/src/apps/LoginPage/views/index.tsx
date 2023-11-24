import { Box } from '@mui/joy';

import LoginModal from '../components/LoginModal';
import publicPath from '@utils/public';
import { useIsLoggedIn } from '@hooks/user';
import { Redirect } from 'wouter';

export default function LoginPage() {
  const loggedIn = useIsLoggedIn();
  if (loggedIn) {
    return <Redirect to="/" />;
  }
  return (
    <Box
      style={{
        width: '100dvw',
        height: '100dvh',
        backgroundImage: `url(${publicPath('/loginPage.webp')})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <LoginModal />
    </Box>
  );
}
