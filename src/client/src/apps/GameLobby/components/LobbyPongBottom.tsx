import { Button } from "@mui/joy";

export default function LobbyPongButton({ label }: { label: string }) {
  return (
    <Button
      sx={{ width: "20dvh", mt: 5 }}
      fullWidth
      type="submit"
      variant="outlined"
      color="warning"
    >
      {label}
    </Button>
  );
}
