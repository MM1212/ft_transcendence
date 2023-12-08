import { UserAvatar } from '@components/AvatarWithStatus';
import AccountArrowDownIcon from '@components/icons/AccountArrowDownIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import RobotIcon from '@components/icons/RobotIcon';
import SwapHorizontalBoldIcon from '@components/icons/SwapHorizontalBoldIcon';
import { useUser } from '@hooks/user';
import tunnel from '@lib/tunnel';
import { Badge, Box, Chip, Divider, IconButton, Tooltip } from '@mui/joy';
import { Typography } from '@mui/joy';
import { Stack } from '@mui/joy';
import PongModel from '@typings/models/pong';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import AlertIcon from '@components/icons/AlertIcon';
import InformationVariantCircleIcon from '@components/icons/InformationVariantCircleIcon';
import CrownIcon from '@components/icons/CrownIcon';
import LobbyGameTypography from './LobbyGameTypography';
import {
  ChangeOwnerButton,
  AddBotButton,
  ChangeTeamButton,
  KickParticipantButton,
} from './LobbyParticipantButtons';
import CheckIcon from '@components/icons/CheckIcon';

export default function LobbyPlayerPlaceholder({
  id,
  teamId,
  teamPosition,
  ready,
  warnForPositionShift = false,
}: {
  id: number | undefined;
  teamId: PongModel.Models.TeamSide;
  teamPosition: number | undefined;
  ready: boolean | undefined;
  warnForPositionShift?: boolean;
}) {
  const user = useUser(id!);
  const lobbyOwner = useRecoilValue(pongGamesState.lobbyOwner);
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
          badgeInset="14%"
          color="warning"
          variant="solid"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          badgeContent={
            <Tooltip title="You'll be moved to the top position when the game starts">
              <InformationVariantCircleIcon size="sm" fontSize="sm" />
            </Tooltip>
          }
          invisible={!warnForPositionShift}
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
          </Box>
          <Typography level="body-sm">Rank Placeholder</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} ml="auto">
          {!id ? (
            <>
              <AddBotButton />
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
