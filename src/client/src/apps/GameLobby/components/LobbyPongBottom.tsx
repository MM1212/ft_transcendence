import { Button, type ButtonProps } from '@mui/joy';

export default function LobbyPongButton({ label, ...props }: { label: string } & ButtonProps) {
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
      {...props}
    >
      {label}
    </Button>
  );
}
