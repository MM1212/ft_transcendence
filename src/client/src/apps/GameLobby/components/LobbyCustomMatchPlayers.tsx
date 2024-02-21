import { Box } from '@mui/joy';
import { Stack } from '@mui/joy';
import LobbyPlayerPlaceholder from './LobbyPlayerPlacehoder';
import LobbyGameTypography from './LobbyGameTypography';
import PongModel from '@typings/models/pong';
import { useCurrentUser } from '@hooks/user';

export default function LobbbyCustomMatchPlayers({
  leftTeam,
  rightTeam,
}: {
  leftTeam: PongModel.Models.ITeam;
  rightTeam: PongModel.Models.ITeam;
}) {
  const [leftPlayer1, leftPlayer2] = leftTeam.players as (
    | PongModel.Models.ILobbyParticipant
    | undefined
  )[];
  const [rightPlayer1, rightPlayer2] = rightTeam.players as (
    | PongModel.Models.ILobbyParticipant
    | undefined
  )[];
  const leftTopPlayer =
    leftPlayer1?.teamPosition === PongModel.Models.TeamPosition.Top
      ? leftPlayer1
      : leftPlayer2;
  const leftBottomPlayer =
    leftPlayer1?.teamPosition === PongModel.Models.TeamPosition.Bottom
      ? leftPlayer1
      : leftPlayer2;
  const rightTopPlayer =
    rightPlayer1?.teamPosition === PongModel.Models.TeamPosition.Top
      ? rightPlayer1
      : rightPlayer2;
  const rightBottomPlayer =
    rightPlayer1?.teamPosition === PongModel.Models.TeamPosition.Bottom
      ? rightPlayer1
      : rightPlayer2;

  const myUser = useCurrentUser();
  if (!myUser) return null;
  return (
    <Stack direction="row" width="100%" alignItems="center" alignSelf="center">
      <Box width="100%">
        <LobbyGameTypography sx={{ mb: 2, border: 'unset' }} level="title-lg">
          Team 1
        </LobbyGameTypography>
        <LobbyPlayerPlaceholder
          isMe={leftTopPlayer?.id === myUser.id}
          id={leftTopPlayer?.id}
          teamId={PongModel.Models.TeamSide.Left}
          teamPosition={PongModel.Models.TeamPosition.Top}
          ready={leftTopPlayer?.status === PongModel.Models.LobbyStatus.Ready || leftTopPlayer?.status === PongModel.Models.LobbyStatus.Playing}
        />
        <LobbyPlayerPlaceholder
          isMe={leftBottomPlayer?.id === myUser.id}
          id={leftBottomPlayer?.id}
          teamId={PongModel.Models.TeamSide.Left}
          teamPosition={PongModel.Models.TeamPosition.Bottom}
          ready={
            leftBottomPlayer?.status === PongModel.Models.LobbyStatus.Ready || leftBottomPlayer?.status === PongModel.Models.LobbyStatus.Playing
          }
        />
      </Box>
      <Box width="20%"></Box>
      <Box
        display="flex"
        justifyContent="left"
        flexDirection="column"
        width="100%"
      >
        <LobbyGameTypography sx={{ mb: 2, border: 'unset' }} level="title-lg">
          Team 2
        </LobbyGameTypography>
        <LobbyPlayerPlaceholder
          isMe={rightTopPlayer?.id === myUser.id}
          id={rightTopPlayer?.id}
          teamId={PongModel.Models.TeamSide.Right}
          teamPosition={PongModel.Models.TeamPosition.Top}
          ready={rightTopPlayer?.status === PongModel.Models.LobbyStatus.Ready || rightTopPlayer?.status === PongModel.Models.LobbyStatus.Playing}
        />
        <LobbyPlayerPlaceholder
          isMe={rightBottomPlayer?.id === myUser.id}
          id={rightBottomPlayer?.id}
          teamId={PongModel.Models.TeamSide.Right}
          teamPosition={PongModel.Models.TeamPosition.Bottom}

          ready={
            rightBottomPlayer?.status === PongModel.Models.LobbyStatus.Ready || rightBottomPlayer?.status === PongModel.Models.LobbyStatus.Playing
          }
        />
      </Box>
    </Stack>
  );
}
