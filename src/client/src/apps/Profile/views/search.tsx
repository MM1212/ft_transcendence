import { Box, Divider, Sheet } from '@mui/joy';
import UserSearch from '../components/UserSearchInput';
import UserSearchResults from '../components/UserSearchResults';

export default function ProfileSearchView(): JSX.Element {
  return (
    <Sheet
      sx={{
        height: '100%',
        width: '45dvh',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        p: 2,
        gap: 2,
        flexDirection: 'column',
      }}
    >
      <UserSearch />
      <Divider />
      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 1 }}>
        <UserSearchResults />
      </Box>
    </Sheet>
  );
}
