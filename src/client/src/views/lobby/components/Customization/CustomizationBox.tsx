import { Box } from "@mui/joy";
import { CardCover } from "@mui/joy";
import { Card } from "@mui/joy";

export default function CustomizationBox() {
  return (
    <Box
      component="ul"
      justifyContent="center"
      sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 1.5, m: 0 }}
    >
      <Card component="li" sx={{ width: 150, height: 150 }}>
        <CardCover>
          <img
            src="https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800"
            srcSet="https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800&dpr=2 2x"
            loading="lazy"
            alt=""
          />
        </CardCover>
      </Card>
    </Box>
  );
}
