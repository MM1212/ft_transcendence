import Sheet from '@mui/joy/Sheet';
import MessagesPane from '../components/MessagesPane';
import ChatsPane from '../components/ChatsPane';
import NewChatModal from '../components/NewChat';
import React from 'react';
import { useRecoilCallback } from 'recoil';
import { Route, Switch, useParams } from 'wouter';
import chatsState from '../state';
import ChatMembersModal from '../components/management/ChatMembers';
import ChatManageMuteModal from '../components/management/ChatManageMuteModal';
import { navigate } from 'wouter/use-location';
import { Typography } from '@mui/joy';
import EmoticonSadIcon from '@components/icons/EmoticonSadIcon';

function _View(): JSX.Element {
  return (
    <Sheet
      sx={{
        flex: 1,
        width: '100%',
        mx: 'auto',
        pt: { xs: 'var(--Header-height)', sm: 0 },
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'minmax(min-content, min(30%, 40dvh)) 1fr',
        },
      }}
    >
      <Sheet
        sx={{
          position: {
            xs: 'fixed',
            sm: 'sticky',
          },
          transform: {
            xs: 'translateX(calc(100% * (var(--MessagesPane-slideIn, 0) - 1)))',
            sm: 'none',
          },
          transition: 'transform 0.4s, width 0.4s',
          zIndex: 100,
          height: '100%',
        }}
      >
        <ChatsPane />
      </Sheet>
      <Switch>
        <Route path="/messages/not-found">
          <Sheet
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40dvh',
              height: '100%',
              gap: 1,
            }}
          >
            <EmoticonSadIcon size="lg" />
            <Typography level="h3">Chat not found</Typography>
          </Sheet>
        </Route>
        <Route>
          <MessagesPane />
        </Route>
      </Switch>
      <NewChatModal />
      <ChatMembersModal />
      <ChatManageMuteModal />
    </Sheet>
  );
}

const View = React.memo(_View);

export default function ChatMessagesView() {
  const { chatId } = useParams();

  const updateSelectedChat = useRecoilCallback(
    (ctx) => async (id: number) => {
      if (id !== -1) {
        const chats = await ctx.snapshot.getPromise(chatsState.chats);
        if (!chats.includes(id))
          return navigate('/messages/not-found', { replace: true });
      }
      ctx.set(chatsState.selectedChatId, id);
    },
    []
  );

  React.useEffect(() => {
    updateSelectedChat((chatId && parseInt(chatId)) || -1);
  }, [updateSelectedChat, chatId]);
  return <View />;
}
