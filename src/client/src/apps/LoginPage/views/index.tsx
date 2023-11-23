import { Box } from '@mui/joy';

import LoginModal from '../components/LoginModal';
import publicPath from '@utils/public';

export default function LoginPage() {
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
