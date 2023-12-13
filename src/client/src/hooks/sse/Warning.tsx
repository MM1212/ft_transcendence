import { Avatar, Tooltip } from '@mui/joy';
import { useIsSseConnected } from '.';
import AccessPointOffIcon from '@components/icons/AccessPointOffIcon';

export default function SseWarning(): JSX.Element {
  const isConnected = useIsSseConnected();
  if (isConnected) return <></>;
  return (
    <Tooltip title="Connection lost, please refresh the page">
      <Avatar
        variant="solid"
        color="danger"
        size="lg"
        sx={{
          position: 'absolute',
          mt: 1,
          mr: 1,
          top: 0,
          right: 0,
          zIndex: 1301,
        }}
      >
        <AccessPointOffIcon />
      </Avatar>
    </Tooltip>
  );
}
