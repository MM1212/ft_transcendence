import React, { useState} from "react";
import Box from "@mui/joy/Box";
import Drawer from "@mui/joy/Drawer";

import { List, ListItem, Button, styled, Sheet, Typography } from "@mui/joy";
import { useKeybindsToggle } from "@hooks/keybinds";
import { Link } from "wouter";
import { drawerOpenAtom } from "./state";
import { useRecoilState } from "recoil";
//import HomeIcon from "@components/IconMaterial";

const CustomDrawer = styled(Drawer)(({ theme }) => ({
  //   [`.${drawerClasses.content}`]: {
  //     backgroundColor: `rgba(${theme.vars.palette.background.surface} / 0.72)`,
  //   },
}));


export default function DrawerCloseButton() {
	const [open, setOpen] = useRecoilState(drawerOpenAtom);

	const handleCloseDrawer = () => {
		setOpen(false);
  };
	
  
	const handleOpenDrawer = React.useCallback(
    (key: string, pressed: boolean) => {
      if (!pressed) return;
      if (key !== "KeyM") return;
			setOpen((prev) => !prev);
    },
    [setOpen]
  );
  const listItemStyles = {
    display: "flex",
    bgcolor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    p: 1,
    width: "100%",
  };

	useKeybindsToggle(["KeyM"], handleOpenDrawer, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CustomDrawer
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{
          content: {
            sx: {
              width: "100%",
              justifyContent: "space-evenly",
              alignItems: "center",
              bgcolor: "rgba(51,51,51)",
              p: { md: 5, sm: 0 },
              boxShadow: "none",
            },
          },
        }}
      >
        <Sheet
          sx={{
            borderRadius: "md",
            bgcolor: "rgba(0, 0, 0, 0.3)",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "35%",
            width: "20%",
            overflow: "auto",
          }}
		>
		<Typography sx={{ 
			listItemStyles,
			alignSelf: "center", 
				}}>Game Menu</Typography>
          <List>
            <ListItem>
              <Button sx={listItemStyles} component={Link} href="/">
                <Typography>Home</Typography>
              </Button>
            </ListItem>
            <ListItem>
              <Button sx={listItemStyles}>Costumize</Button>
            </ListItem>
            <ListItem>
              <Button sx={listItemStyles}>Key Bindings</Button>
            </ListItem>
            <ListItem>
              <Button sx={listItemStyles}>Exit Game</Button>
            </ListItem>
          </List>
        </Sheet>
      </CustomDrawer>
    </Box>
  );
}
