import MenuLeftOutlineIcon from "@components/icons/MenuLeftOutlineIcon";
import MenuRightOutlineIcon from "@components/icons/MenuRightOutlineIcon";
import { Box, IconButton, Tooltip, Typography } from "@mui/joy";
import PongModel from "@typings/models/pong";
import React from "react";

export const specialPowerConfig =  new Map<string,string>([
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.bubble,
    PongModel.Endpoints.Targets.PowerWaterTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.fire,
    PongModel.Endpoints.Targets.PowerFireTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.ghost,
    PongModel.Endpoints.Targets.PowerGhostTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.ice,
    PongModel.Endpoints.Targets.PowerIceTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.spark,
    PongModel.Endpoints.Targets.PowerSparkTexture,
  ],
]);

export function ChangePower() {
  const [keys] = React.useState<string[]>(() => [...specialPowerConfig.keys()]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);

  const onNext = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % keys.length);
  }, [keys]);

  const onPrev = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + keys.length) % keys.length);
  }, [keys]);

  if (!specialPowerConfig.has(keys[currentIndex])) return <></>;
  const currentPowerPath = specialPowerConfig.get(keys[currentIndex])!;
  return (
    <>
      <Box>
        <IconButton onClick={onPrev}>
          <MenuLeftOutlineIcon />
        </IconButton>
        <Tooltip title={keys[currentIndex]} placement="top">
          <img src={currentPowerPath ?? undefined} />
        </Tooltip>
        <IconButton onClick={onNext}>
          <MenuRightOutlineIcon />
        </IconButton>
      </Box>
    </>
  );
}
