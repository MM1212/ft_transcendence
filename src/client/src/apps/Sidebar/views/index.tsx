import React from 'react';
import Drawer from '@mui/joy/Drawer';
import { Sheet, Divider } from '@mui/joy';
import { useKeybindsToggle } from '@hooks/keybinds';
import SidebarRoutes from '../components/RoutesComposer';
import SidebarUserCard from '../components/UserCard';
import { sessionAtom } from '@hooks/user';
import { useRecoilCallback } from 'recoil';
import SidebarSwitchComposer from '../components/SwitchComposer';
import { enablePlayerInput } from '@apps/Lobby/state';
import { locationAtom } from '@state/location';
import { navigate } from 'wouter/use-location';

function SidebarContent(): JSX.Element {
  return React.useMemo(
    () => (
      <Sheet
        sx={{
          borderRadius: 'md',
          display: 'flex',
          height: '100%',
          overflow: 'auto',
          width: 'fit-content',
          transition: (theme) => theme.transitions.create('width'),
        }}
      >
        <Sheet
          sx={{
            height: '100%',
            width: '25dvh',
            p: 2,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <SidebarRoutes />
          <Divider />
          <SidebarUserCard />
        </Sheet>
        <SidebarSwitchComposer />
      </Sheet>
    ),
    []
  );
}

function _SideBarDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}): JSX.Element {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      variant="plain"
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { md: 3, sm: 0 },
            boxShadow: 'none',
            display: 'inline-block',
            width: 'fit-content',
          },
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  );
}

const SideBarDrawer = React.memo(_SideBarDrawer);

export default function SideBar() {
  const [open, setOpen] = React.useState(false);
  const [lastRoute, setLastRoute] = React.useState<string>('/');
  const handleCloseDrawer = useRecoilCallback(
    (ctx) => async () => {
      const location = await ctx.snapshot.getPromise(locationAtom);
      setLastRoute(location);
      navigate('/');
      setOpen(false);
      ctx.set(enablePlayerInput, true);
    },
    []
  );
  const handleOpenDrawer = useRecoilCallback(
    (ctx) => async (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== 'Escape') return;
      const loggedIn = !!(await ctx.snapshot.getPromise(sessionAtom));
      if (!loggedIn) return;
      navigate(lastRoute);
      setOpen((prev) => !prev);
      ctx.set(enablePlayerInput, false);
    },
    [setOpen, lastRoute]
  );

  const openDrawerOnLocation = useRecoilCallback(
    (ctx) => async () => {
      const location = await ctx.snapshot.getPromise(locationAtom);
      if (location !== '/') {
        setOpen(true);
        ctx.set(enablePlayerInput, false);
      }
    },
    []
  );

  React.useEffect(() => {
    openDrawerOnLocation();
  }, [openDrawerOnLocation]);

  useKeybindsToggle(['Escape'], handleOpenDrawer, []);

  return <SideBarDrawer open={open} onClose={handleCloseDrawer} />;
}
