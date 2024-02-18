import { useCurrentUser } from '@hooks/user';
import { Divider, Sheet } from '@mui/joy';
import LobbyGameTypography from '@apps/GameLobby/components/LobbyGameTypography';
import MatchHistoryList from '@apps/MatchHistory/components/MatchHistoryList';
import { useParams } from 'wouter';
import React from 'react';
import GenericPlaceholder from '@components/GenericPlaceholder';
import HistoryIcon from '@components/icons/HistoryIcon';

function Wrapper({ children }: React.PropsWithChildren<{}>): JSX.Element {
  return (
    <Sheet
      sx={{
        width: '80dvh',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <LobbyGameTypography level="body-lg">Match History</LobbyGameTypography>
      <Divider />
      {children}
    </Sheet>
  );
}

function MatchHistoryMe() {
  const user = useCurrentUser();
  if (!user)
    return (
      <Wrapper>
        <GenericPlaceholder
          icon={<HistoryIcon />}
          title="Match History Not Found"
          label="You are not logged in. Please log in to view your match history."
          centerVertical
          path="/login"
        />
      </Wrapper>
    );
  return (
    <Wrapper>
      <MatchHistoryList targetId={user.id} isMe />
    </Wrapper>
  );
}

export default function MatchHistory() {
  const { id: targetId } = useParams<{ id: string }>();

  if (
    !targetId ||
    (targetId !== 'me' && isNaN(parseInt(targetId))) ||
    parseInt(targetId) < 0
  ) {
    return (
      <Wrapper>
        <GenericPlaceholder
          icon={<HistoryIcon />}
          title="Match History Not Found"
          label="The match history you are looking for does not exist."
          centerVertical
        />
      </Wrapper>
    );
  }
  if (targetId === 'me') return <MatchHistoryMe />;
  return (
    <Wrapper>
      <MatchHistoryList targetId={parseInt(targetId)} />
    </Wrapper>
  );
}
