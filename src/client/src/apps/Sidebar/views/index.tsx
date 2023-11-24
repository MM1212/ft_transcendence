import React from 'react';
import Drawer from '@mui/joy/Drawer';
import { Sheet, Divider } from '@mui/joy';
import { useLocation } from 'wouter';
import { useKeybindsToggle } from '@hooks/keybinds';
import SidebarRoutes from '../components/RoutesComposer';
import SidebarUserCard from '../components/UserCard';
import { sessionAtom } from '@hooks/user';
import { useRecoilCallback } from 'recoil';
import SidebarSwitchComposer from '../components/SwitchComposer';

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

export default function SideBar() {
  const [location, navigate] = useLocation();
  const [open, setOpen] = React.useState(location !== '/');
  const [lastRoute, setLastRoute] = React.useState<string>('/');
  const handleCloseDrawer = () => {
    setLastRoute(location);
    navigate('/');
    setOpen(false);
  };
  const handleOpenDrawer = useRecoilCallback(
    (ctx) => async (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== 'Escape') return;
      const loggedIn = !!(await ctx.snapshot.getPromise(sessionAtom));
      if (!loggedIn) return;
      navigate(lastRoute);
      setOpen((prev) => !prev);
    },
    [setOpen, navigate, lastRoute]
  );

  useKeybindsToggle(['Escape'], handleOpenDrawer, []);

  return (
    <Drawer
      open={open}
      onClose={handleCloseDrawer}
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
