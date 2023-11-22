import {
  Modal,
  Sheet,
  Typography,
} from '@mui/joy';
import React from 'react';
import { LoginSquare } from './LoginSquare';

export default function LoginModal() {
  return (
    <>
      {/* <Button variant="outlined" color="neutral" onClick={() => setOpen(true)}>
        Open modal
      </Button> */}
      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={true}
        disableAutoFocus
        // open={open}
        // onClose={() => setOpen(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
          variant="soft"
          sx={{
            width: '25vw',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 'md',
            gap: theme => theme.spacing(2),
            p: 3,
            boxShadow: 'lg',
            backgroundColor: 'background.surface'
          }}
        >
          <Typography textAlign="center" level="h1">
            Welcome to Dojo Pong
          </Typography>
          <LoginSquare />
        </Sheet>
      </Modal>
    </>
  );
}
