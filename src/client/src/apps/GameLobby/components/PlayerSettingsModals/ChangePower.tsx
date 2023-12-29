import MenuLeftOutlineIcon from "@components/icons/MenuLeftOutlineIcon";
import MenuRightOutlineIcon from "@components/icons/MenuRightOutlineIcon";
import { Box, IconButton, Typography } from "@mui/joy";
import PongModel from "@typings/models/pong";
import React from "react";

const initPowers = (): Map<number, { name: string; path: string }> => {
  return new Map([
    [
      0,
      {
        name: PongModel.Models.LobbyParticipantSpecialPowerType.bubble,
        path: PongModel.Endpoints.Targets.PowerWaterTexture,
      },
    ],
    [
      1,
      {
        name: PongModel.Models.LobbyParticipantSpecialPowerType.fire,
        path: PongModel.Endpoints.Targets.PowerFireTexture,
      },
    ],
    [
      2,
      {
        name: PongModel.Models.LobbyParticipantSpecialPowerType.ghost,
        path: PongModel.Endpoints.Targets.PowerGhostTexture,
      },
    ],
    [
      3,
      {
        name: PongModel.Models.LobbyParticipantSpecialPowerType.ice,
        path: PongModel.Endpoints.Targets.PowerIceTexture,
      },
    ],
    [
      4,
      {
        name: PongModel.Models.LobbyParticipantSpecialPowerType.spark,
        path: PongModel.Endpoints.Targets.PowerSparkTexture,
      },
    ],
  ]);
};

export function ChangePower() {
  const [powers] = React.useState(initPowers());
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const onNext = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % powers.size);
  }, [powers.size]);

  const onPrev = React.useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + powers.size) % powers.size);
  }, [powers.size]);

  if (!powers || !powers.has(currentIndex)) return <></>;
  const currentPower = powers.get(currentIndex);
  return (
    <>
      <Box>
        <IconButton onClick={onPrev}>
          <MenuLeftOutlineIcon />
        </IconButton>
        <img src={currentPower?.path} />
        <IconButton onClick={onNext}>
          <MenuRightOutlineIcon />
        </IconButton>
        <Typography>{currentPower?.name}</Typography>
      </Box>
    </>
  );
}
