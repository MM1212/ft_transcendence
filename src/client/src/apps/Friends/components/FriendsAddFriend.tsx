import { Button } from '@mui/joy';
import React from 'react';
import BasicModalDialog from './AddFriendForm';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';

export default function AddFriend() {
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(true)}
        variant="solid"
        color="success"
        size="md"
        sx={{
          display: { xs: 'none', md: 'inline-flex' },
          alignItems: 'center',
          fontWeight: 500,
          fontSize: (theme) => theme.typography['body-md'].fontSize,
        }}
        startDecorator={<AccountPlusIcon />}
      >
        Add Friend
      </Button>
      <BasicModalDialog open={open} setOpen={setOpen}></BasicModalDialog>
    </React.Fragment>
  );
}
