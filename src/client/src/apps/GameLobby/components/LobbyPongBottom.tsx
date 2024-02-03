import { Button } from '@mui/joy';

export default function LobbyPongButton({ label }: { label: string }) {
  return (
    <Button
      fullWidth
      type="submit"
      variant="soft"
      color="warning"
      sx={({
        width: '20dvh',
        mt: 5,
        border: '2px solid',
        borderColor: 'divider',
      })}
    >
      {label}
    </Button>
  );
}
