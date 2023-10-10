import React, { useState, useEffect } from "react";
import Box from "@mui/joy/Box";
import Drawer, { drawerClasses } from "@mui/joy/Drawer";
import DialogTitle from "@mui/joy/DialogTitle";
import ModalClose from "@mui/joy/ModalClose";

import { List, ListItem, Button, styled, Sheet, Typography } from "@mui/joy";
import { useKeybindsToggle } from "@hooks/keybinds";
import { Link } from "wouter";

const CustomDrawer = styled(Drawer)(({ theme }) => ({
  //   [`.${drawerClasses.content}`]: {
  //     backgroundColor: `rgba(${theme.vars.palette.background.surface} / 0.72)`,
  //   },
}));

export default function DrawerCloseButton() {
  const [open, setOpen] = useState(false);

  const handleCloseDrawer = () => {
    setOpen(false);
  };

  const handleOpenDrawer = React.useCallback(
    (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== "KeyM") return;
      setOpen(prev => !prev);
    },
    []
  );

  useKeybindsToggle(["KeyM"], handleOpenDrawer, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CustomDrawer
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{
          content: {
            sx: {
              bgcolor: "transparent",
              p: { md: 3, sm: 0 },
              boxShadow: "none",
            },
          },
        }}
      >
        <Sheet
          sx={{
            borderRadius: "md",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "100%",
            overflow: "auto",
          }}
        >
          <ModalClose />
          <List>
            <ListItem>
			<Button component={Link} href="/">
			<Typography>Main Menu</Typography>
			</Button>
            </ListItem>
            <ListItem>
              <Button>Exit</Button>
            </ListItem>
          </List>
        </Sheet>
      </CustomDrawer>
    </Box>
  );
}
