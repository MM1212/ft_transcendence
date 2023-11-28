import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
} from '@mui/joy';

import publicPath from '@utils/public';
import { useIsLoggedIn } from '@hooks/user';
import { Redirect } from 'wouter';
import CodeArrayIcon from '@components/icons/CodeArrayIcon';
import TFAInput from '@apps/Profile/components/2FAInput';
import { buildTunnelEndpoint, useTunnelEndpoint } from '@hooks/tunnel';
import { AuthModel } from '@typings/models';
import React from 'react';
import tunnel from '@lib/tunnel';
import notifications from '@lib/notifications/hooks';
import { mutate } from 'swr';

export default function TFALoginPage() {
  const [code, setCode] = React.useState('');
  const loggedIn = useIsLoggedIn();
  const { data, isLoading } = useTunnelEndpoint(
    AuthModel.Endpoints.Targets.IsLoggingInTFA
  );
  if (loggedIn) {
    return <Redirect to="/" />;
  }

  if (!isLoading && (!data || data.status !== 'ok' || !data.data))
    return <Redirect to="/login" />;

  const onSubmit = async () => {
    try {
      await tunnel.post(AuthModel.Endpoints.Targets.TfaCallback, {
        code: code.replace(/ /g, ''),
      });
      await mutate(
        buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session),
        undefined,
        {
          revalidate: true,
        }
      );
      notifications.success('Logged in with 2FA');
    } catch (e) {
      notifications.error('Failed to login with 2FA', (e as Error).message);
    }
  };
  const codeSanitized = code.replace(/ /g, '');
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
      <Modal open>
        <ModalDialog>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogContent
            sx={{
              mt: 1,
            }}
          >
            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                onSubmit();
              }}
            >
              <FormControl>
                <FormLabel>6-digit code</FormLabel>
                <Input
                  placeholder="Enter your code here.."
                  startDecorator={<CodeArrayIcon />}
                  slotProps={{ input: { component: TFAInput } }}
                  value={code}
                  onChange={(ev) => ev.target && setCode(ev.target.value)}
                />
              </FormControl>
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              variant="soft"
              color="primary"
              onClick={onSubmit}
              disabled={
                codeSanitized.length !== 6 || !/^\d+$/.test(codeSanitized)
              }
            >
              Login
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
