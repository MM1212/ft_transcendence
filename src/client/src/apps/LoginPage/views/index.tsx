import Link from '@components/Link';
import Logo from '@components/Logo';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { useSession } from '@hooks/user';
import notifications, { NotificationProps } from '@lib/notifications/hooks';
import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Modal,
  ModalClose,
  Sheet,
  Typography,
} from '@mui/joy';
import { AuthModel } from '@typings/models';
import React from 'react';

export default function LoginPage() {
  const [open, setOpen] = React.useState<boolean>(true);

  const { user, loading, loggedIn, logout } = useSession();

  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
          variant="outlined"
          sx={{
            width: 500,
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          {/* <Typography
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
          >
            This is the modal title
          </Typography>
          <Typography id="modal-desc" textColor="text.tertiary">
            Make sure to use <code>aria-labelledby</code> on the modal dialog with an
            optional <code>aria-describedby</code> attribute.
          </Typography> */}
        </Sheet>
      </Modal>
    </>
  );
}
