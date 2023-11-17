import { Box, Button } from "@mui/joy";
import { CardCover } from "@mui/joy";
import { Card } from "@mui/joy";

export default function CustomizationBox({
  clicable,
  imageUrl,
  selected,
  size = 150
}: {
  clicable: boolean;
  imageUrl: string;
  selected?: boolean;
  size?: number;
}) {
  return (
    <Box
      component="ul"
      justifyContent="center"
      sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 1.5, m: 0 }}
    >
      <Card component="li" sx={{ width: size, height: size }}>
        <CardCover sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: selected ? 'background.level1' : 'unset'
        }}>
          <img src={imageUrl} style={{
            width: "auto",
            height: "auto",
            maxWidth: size,
          }}  />
        </CardCover>
        {clicable && (
          <Button
            sx={{
              height: "100%",
              width: "100%",
              backgroundColor: "unset",
              "&:hover": {
                backgroundColor: "unset",
              },
            }}
          ></Button>
        )}
      </Card>
    </Box>
  );
}
