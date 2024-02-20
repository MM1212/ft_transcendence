import { UserAvatar } from "@components/AvatarWithStatus";
import { useUser } from "@hooks/user";
import { Badge, Box, Chip, Divider, Tooltip } from "@mui/joy";
import { Typography } from "@mui/joy";
import { Stack } from "@mui/joy";
import PongModel from "@typings/models/pong";
import { useRecoilCallback, useRecoilValue } from "recoil";
import pongGamesState from "../state";
import CrownIcon from "@components/icons/CrownIcon";
import LobbyGameTypography from "./LobbyGameTypography";
import {
  ChangeOwnerButton,
  AddBotButton,
  ChangeTeamButton,
  KickParticipantButton,
} from "./LobbyParticipantButtons";
import CheckIcon from "@components/icons/CheckIcon";
import CogOutlineIcon from "@components/icons/CogOutlineIcon";
import { Modal } from "@mui/joy";
import { ModalDialog } from "@mui/joy";
import React from "react";
import LobbyPongButton from "./LobbyPongBottom";
import { FindMatchWrapper } from "./LobbyMatchMaking";
import { GroupEnumValues } from "@typings/utils";
import { ArrowSelector } from "@components/ArrowSelector/ArrowSelector";

export default function LobbyPlayerPlaceholder({
  id,
  teamId,
  teamPosition,
  ready,
  specialPower,
  isMe,
}: {
  id: number | undefined;
  teamId: PongModel.Models.TeamSide;
  teamPosition: number | undefined;
  ready: boolean | undefined;
  specialPower: GroupEnumValues<PongModel.Models.LobbyParticipantSpecialPowerType> | undefined;
  isMe: boolean;
}) {

  const user = useUser(id!);
  const [open, setOpen] = React.useState<boolean>(false);
  const lobbyOwner = useRecoilValue(pongGamesState.lobbyOwner);

  const [currPower, setCurrPower] = React.useState<string>(PongModel.Endpoints.Targets.PowerSparkTexture);
  const [currPaddle, setCurrPaddle] = React.useState<string>(PongModel.Models.Paddles.PaddleRed);


  const handleCloseModalSendOptions = useRecoilCallback((ctx) => async () => {
    try {
      console.log('submit' + currPower + currPaddle);

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  })

  if (lobbyOwner === null) return null;
  return (
    <>
      <Divider />
      <Stack
        display="flex"
        flexDirection="row"
        alignItems="center"
        sx={{ py: 2 }}
      >
        <Badge
          color="warning"
          variant="outlined"
          badgeInset="8%"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            badge: {
              sx: {
                py: 0.5,
              },
            },
          }}
          invisible={!specialPower}
          badgeContent={
            isMe && (
              <Tooltip title={specialPower} placement="top">
                <img
                  src={currPower}
                  style={{ width: '1.2dvh', height: '1.2dvh' }}
                />
              </Tooltip>
            )
          }
        >
          <UserAvatar
            color={ready ? 'success' : 'warning'}
            variant="soft"
            src={!ready ? user?.avatar : undefined}
            sx={{ width: 50, height: 50 }}
          >
            {ready ? <CheckIcon /> : undefined}
          </UserAvatar>
        </Badge>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          sx={{ pl: 2 }}
        >
          <Box display="flex" gap={1} alignItems="center">
            <LobbyGameTypography level="body-lg">
              {user?.nickname}
            </LobbyGameTypography>
            {user?.id === lobbyOwner && (
              <Tooltip title="Sensei 🥋">
                <Chip color="warning" variant="plain" size="sm">
                  <CrownIcon size="sm" fontSize="sm" />
                </Chip>
              </Tooltip>
            )}
            {isMe ? (
              <>
                <CogOutlineIcon onClick={() => setOpen(true)} size="sm" />
                <Modal
                  open={open}
                  onClose={handleCloseModalSendOptions}
                >
                  <ModalDialog>
                    <Box
                      gap={4}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <LobbyGameTypography level="body-lg">
                        Pick Your Poison
                      </LobbyGameTypography>
                      <ArrowSelector selectType="special_power" onClick={setCurrPower} />
                      <ArrowSelector selectType="paddle" onClick={setCurrPaddle} />
                    </Box>
                    <FindMatchWrapper
                      sx={{
                        position: 'relative',
                        m: 'auto!important',
                      }}
                      onClick={() => setOpen(false)}
                    >
                      <LobbyPongButton label="Confirm" />
                    </FindMatchWrapper>
                  </ModalDialog>
                </Modal>
              </>
            ) : null}
          </Box>
          <Typography level="body-sm">Rank Placeholder</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} ml="auto">
          {!id ? (
            <>
              <AddBotButton teamId={teamId} teamPosition={teamPosition} />
              <ChangeTeamButton teamId={teamId} teamPosition={teamPosition} />
            </>
          ) : (
            <>
              <ChangeOwnerButton id={id} ownerId={lobbyOwner} />
              <KickParticipantButton id={id} ownerId={lobbyOwner} />
            </>
          )}
        </Box>
      </Stack>
      <Divider />
    </>
  );
}
