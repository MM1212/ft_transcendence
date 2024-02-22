import { Button, type ButtonProps } from '@mui/joy';

export default function LobbyPongButton({
  label,
  disableMargin,
  ...props
}: { label: string; disableMargin?: boolean } & ButtonProps) {
  return (
    <Button
      fullWidth
      type="submit"
      variant="soft"
      color="warning"
      sx={{
        minWidth: '20dvh',
        mt: disableMargin ? undefined : 5,
        border: '2px solid',
        borderColor: 'divider',
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
