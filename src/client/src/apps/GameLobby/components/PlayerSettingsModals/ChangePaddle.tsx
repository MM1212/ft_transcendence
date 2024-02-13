import MenuLeftOutlineIcon from "@components/icons/MenuLeftOutlineIcon";
import MenuRightOutlineIcon from "@components/icons/MenuRightOutlineIcon";
import { Box, IconButton, Tooltip } from "@mui/joy";
import PongModel from "@typings/models/pong";
import publicPath from "@utils/public";
import React from "react";

export default function ChangePaddle() {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  return (
    <>
      <Box>
        <IconButton>
          <MenuLeftOutlineIcon />
        </IconButton>
        <Tooltip title="Paddle Name" placement="top">
          <img src={publicPath(`${PongModel.Endpoints.Targets.Paddles}/PaddleRed.webp`)} />
        </Tooltip>
        <IconButton>
          <MenuRightOutlineIcon />
        </IconButton>
      </Box>
    </>
  );
}
