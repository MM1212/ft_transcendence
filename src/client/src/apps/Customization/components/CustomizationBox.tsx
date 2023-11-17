import { Box, Button } from "@mui/joy";
import { CardCover } from "@mui/joy";
import { Card } from "@mui/joy";

export default function CustomizationBox({
  clicable,
  imageUrl,
}: {
  clicable: boolean;
  imageUrl: string;
}) {
  return (
    <Box
      component="ul"
      justifyContent="center"
      sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 1.5, m: 0 }}
    >
      <Card component="li" sx={{ width: 150, height: 150 }}>
        <CardCover sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <img src={imageUrl} style={{
            width: "auto",
            height: "auto",
            maxWidth: 150,
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
