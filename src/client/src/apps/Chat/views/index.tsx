import Sheet from '@mui/joy/Sheet';
import MessagesPane from '../components/MessagesPane';
import ChatsPane from '../components/ChatsPane';
import NewChatModal from '../components/NewChat';

export default function MyProfile() {
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
      <MessagesPane />
      <NewChatModal />
    </Sheet>
  );
}
