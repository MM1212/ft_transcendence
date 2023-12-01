import React from 'react';
import { useCurrentUser } from '.';
import { useUpdateUserModalActions } from '@apps/Profile/hooks/useUpdateUserModal';
import { Stack, Typography } from '@mui/joy';

const useFirstLoginPrompter = () => {
  const user = useCurrentUser();
  const { open } = useUpdateUserModalActions();
  React.useEffect(() => {
    if (!user) return;
    if (!user.firstLogin) return;
    open({
      dismissable: false,
      header: 'Welcome to Dojo Pong!',
      submitAnyway: true,
      body: (
        <Stack
          width="35dvh"
          style={{
            wordBreak: 'break-all',
          }}
          mb={2}
        >
          <Typography level="body-sm">
            Please take a moment to update your profile.
          </Typography>
          <Typography level="body-sm">
            We&apos;ve picked your intra username and an avatar for you.
          </Typography>
          <Typography level="body-sm">
            You can always change your profile by clicking on your
            avatar on the sidebar or on your profile page.
          </Typography>
        </Stack>
      ),
      map: (data) => ({
        ...data,
        firstLogin: false,
      }),
    });
  }, [open, user]);
};

export default useFirstLoginPrompter;
