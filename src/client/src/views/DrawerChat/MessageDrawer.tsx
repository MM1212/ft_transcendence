import React from "react";
import Drawer from "@mui/joy/Drawer";
import { List, ListItem, Typography, ListItemButton, ListItemContent } from "@mui/joy";

function MessageDrawer({ open, onClose }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        width: "250px", // Set the width as needed
        marginLeft: "220px", // Adjust this margin based on the width of the first drawer
      }}
    >
      <Typography>Message Drawer</Typography>
      {/* Add your list items and content here */}
    </Drawer>
  );
}

export default MessageDrawer;





