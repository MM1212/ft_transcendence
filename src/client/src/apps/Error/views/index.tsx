import { Box, Button } from '@mui/joy';

import publicPath from '@utils/public';
import { Modal, Sheet, Typography } from '@mui/joy';
import BugIcon from '@components/icons/BugIcon';
import { navigate } from 'wouter/use-location';
import type { FallbackRender } from '@sentry/react';

function ErrorModal(props: React.ComponentProps<FallbackRender>) {
  return (
    <Modal
      open={true}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Sheet
        variant="soft"
        sx={{
          minWidth: '25vw',
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 'md',
          gap: 2,
          p: 3,
          boxShadow: 'lg',
          backgroundColor: 'background.surface',
        }}
      >
        <Typography
          textAlign="center"
          level="h3"
          startDecorator={<BugIcon fontSize="xl4" />}
        >
          An unexpected error occurred
        </Typography>
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 'md',
            bgcolor: 'background.level1',
            maxHeight: '30vh',
            overflowY: 'auto',
          }}
        >
          <Typography level="body-md" color="warning" variant="plain">
            {props.error?.toString() ?? 'No error message available'}
          </Typography>
          <Typography
            component="pre"
            level="body-xs"
            color="danger"
            variant="plain"
          >
            {props.componentStack ?? 'No stack trace available'}
          </Typography>
        </Sheet>
        <Typography level="body-xs">
          We&apos;ve collected some information about this session to help us
          fix the issue.
        </Typography>
        <Typography level="body-xs">
          Sentry ID: {props.eventId ?? 'No event ID available'}
        </Typography>
        <Button
          variant="soft"
          color="neutral"
          onClick={() => {
            navigate('/', { replace: true });
            props.resetError();
            window.location.reload();
          }}
        >
          Return to the home page
        </Button>
      </Sheet>
    </Modal>
  );
}

export default function ErrorPage(props: React.ComponentProps<FallbackRender>) {
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
      <ErrorModal {...props} />
    </Box>
  );
}
