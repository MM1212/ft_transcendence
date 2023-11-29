import {
  useConfirmationModal,
  useConfirmationModalActions,
} from '@apps/Modals/Confirmation/hooks';
import CodeArrayIcon from '@components/icons/CodeArrayIcon';
import DevicesIcon from '@components/icons/DevicesIcon';
import TwoFactorAuthenticationIcon from '@components/icons/TwoFactorAuthenticationIcon';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Stack,
  Typography,
} from '@mui/joy';
import { AuthModel } from '@typings/models';
import React from 'react';
import { mutate } from 'swr';
import TFAInput from './2FAInput';

enum TFAState {
  Idle,
  Setup,
  Confirm,
  NewDevice,
}

function SetupTFA({
  qrCode,
  onConfirm,
}: {
  qrCode: string;
  onConfirm: (code: string) => void;
}): JSX.Element {
  const [code, setCode] = React.useState('');

  const codeSanitized = code.replace(/ /g, '');
  React.useLayoutEffect(() => {
    if (codeSanitized.length === 6) onConfirm(codeSanitized);
  }, [codeSanitized, onConfirm]);
  return (
    <Grid container spacing={2} mt={1} maxWidth="40dvh">
      <Grid xs={12} sm={5}>
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <img
            src={qrCode}
            alt="2FA"
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
            }}
          />
        </Box>
      </Grid>
      <Grid xs={12} sm={7}>
        <Stack spacing={0.5}>
          <Stack spacing={0.25}>
            <Typography level="title-md">Scan QR code</Typography>
            <Typography level="body-sm">
              Scan with your authenticator app to setup 2FA
            </Typography>
          </Stack>
          <FormControl>
            <Input
              size="sm"
              placeholder="Enter code"
              value={code}
              slotProps={{ input: { component: TFAInput } }}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormControl>
          <Button
            size="sm"
            variant="soft"
            color="primary"
            onClick={() => onConfirm(codeSanitized)}
            disabled={
              !codeSanitized.trim() ||
              codeSanitized.length !== 6 ||
              !/^\d+$/.test(codeSanitized)
            }
          >
            Confirm
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

function NewDeviceTFA({ finish }: { finish: () => void }): JSX.Element {
  const [qrCode, setQrCode] = React.useState('');

  React.useEffect(() => {
    tunnel
      .get(AuthModel.Endpoints.Targets.TfaQrCode)
      .then(setQrCode)
      .catch((e) =>
        notifications.error('Failed to get QR code', (e as Error).message)
      );
  }, []);
  return (
    <Grid container spacing={2} mt={1} maxWidth="40dvh">
      <Grid xs={12} sm={5}>
        <Box
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {!qrCode ? (
            <CircularProgress variant="plain" />
          ) : (
            <img
              src={qrCode}
              alt="2FA"
              style={{
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              }}
            />
          )}
        </Box>
      </Grid>
      <Grid xs={12} sm={7} alignItems="center" display="flex">
        <Stack spacing={1}>
          <Stack spacing={0.25}>
            <Typography level="title-md">Scan QR code</Typography>
            <Typography level="body-sm">
              Scan with your authenticator app to add new device
            </Typography>
          </Stack>
          <Button size="sm" variant="plain" color="primary" onClick={finish}>
            Finish
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

function DisableTFAModalContent(): JSX.Element {
  const { setData } = useConfirmationModal<{ input: string }>();
  const [code, setCode] = React.useState('');
  const codeSanitized = code.replace(/ /g, '');

  React.useEffect(() => {
    setData({ data: { input: codeSanitized } });
  }, [codeSanitized, setData]);

  return (
    <FormControl>
      <FormLabel>Enter a code to disable 2FA</FormLabel>
      <Input
        error={
          !codeSanitized.trim() ||
          codeSanitized.length !== 6 ||
          !/^\d+$/.test(codeSanitized)
        }
        color="neutral"
        variant="outlined"
        startDecorator={<CodeArrayIcon />}
        size="sm"
        placeholder="Code here"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        slotProps={{ input: { component: TFAInput } }}
      />
    </FormControl>
  );
}

export default function UpdateUserTFA(
  user: AuthModel.DTO.Session
): JSX.Element {
  const [qrCode, setQrCode] = React.useState('');
  const [state, setState] = React.useState<TFAState>(TFAState.Idle);
  const handleSetup = React.useCallback(async () => {
    try {
      const qrCode = await tunnel.post(
        AuthModel.Endpoints.Targets.TfaSetup,
        undefined
      );
      setQrCode(qrCode);
      setState(TFAState.Setup);
    } catch (e) {
      notifications.error(
        'Failed to initialize setup for 2FA',
        (e as Error).message
      );
    }
  }, []);

  const handleSetupConfirm = React.useCallback(async (code: string) => {
    try {
      await tunnel.post(AuthModel.Endpoints.Targets.TfaSetupConfirm, {
        code,
      });
      setState(TFAState.Idle);
      mutate(
        buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session),
        undefined,
        {
          revalidate: true,
        }
      );
      notifications.success('2FA enabled!');
    } catch (e) {
      notifications.error('Failed to confirm 2FA', (e as Error).message);
    }
  }, []);

  const { confirm, getData } = useConfirmationModalActions<{ input: string }>();
  const disable = React.useCallback(async () => {
    try {
      const ok = await confirm({
        header: 'Disable 2FA',
        content: <DisableTFAModalContent />,
        headerIcon: TwoFactorAuthenticationIcon,
      });
      if (!ok) return;
      const { data } = await getData();
      if (!data) return;
      await tunnel.post(AuthModel.Endpoints.Targets.TfaDisable, {
        code: data.input,
      });
      mutate(
        buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session),
        undefined,
        {
          revalidate: true,
        }
      );
      notifications.success('2FA disabled!');
    } catch (e) {
      notifications.error('Failed to disable 2FA', (e as Error).message);
    }
  }, [confirm, getData]);

  const [opened, setOpened] = React.useState(false);

  const stateComponent = React.useMemo(() => {
    switch (state) {
      case TFAState.Idle:
        return null;
      case TFAState.Setup:
        return <SetupTFA qrCode={qrCode} onConfirm={handleSetupConfirm} />;
      case TFAState.NewDevice:
        return <NewDeviceTFA finish={() => setState(TFAState.Idle)} />;
      default:
        return null;
    }
  }, [handleSetupConfirm, qrCode, state]);

  React.useEffect(() => {
    setState(TFAState.Idle);
    setQrCode('');
  }, [opened]);

  return (
    <Stack
      spacing={1}
      justifyContent="flex-start"
      mt={(theme) => `${theme.spacing(2)} !important`}
    >
      <AccordionGroup
        variant="outlined"
        sx={{
          borderRadius: 'sm',
        }}
      >
        <Accordion
          expanded={opened}
          onChange={(_, opened) => setOpened(opened)}
        >
          <AccordionSummary>Two Factor Authentication</AccordionSummary>
          <AccordionDetails>
            <Stack
              spacing={2}
              mt={1}
              direction={user.tfaEnabled ? 'column' : 'row'}
              alignItems="center"
            >
              <Typography level="title-md">
                Status:{' '}
                <Typography color="neutral" level="body-sm">
                  {user.tfaEnabled ? 'Enabled' : 'Disabled'}{' '}
                </Typography>
              </Typography>
              {user.tfaEnabled ? (
                <ButtonGroup
                  variant={user.tfaEnabled ? 'soft' : 'plain'}
                  color="primary"
                >
                  <Button
                    startDecorator={<TwoFactorAuthenticationIcon />}
                    onClick={user.tfaEnabled ? disable : handleSetup}
                  >
                    {user.tfaEnabled ? 'Disable' : 'Setup'}
                  </Button>
                  {user.tfaEnabled && (
                    <Button
                      startDecorator={<DevicesIcon />}
                      onClick={() => setState(TFAState.NewDevice)}
                    >
                      New Device
                    </Button>
                  )}
                </ButtonGroup>
              ) : (
                <Button
                  variant={'plain'}
                  color="primary"
                  startDecorator={<TwoFactorAuthenticationIcon />}
                  onClick={handleSetup}
                >
                  Setup
                </Button>
              )}
            </Stack>
            {stateComponent}
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Stack>
  );
}
