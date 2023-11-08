import { Box, Sheet } from "@mui/joy";

export default function CustomizationPanel() {
  return (
    <Sheet sx={{ width: "80%" }}>
      <Box
        flexDirection={"row-reverse"}
        sx={{ width: "30%", p: 1.25, borderRadius: "lg" }}
      >
        This Box 1
      </Box>
      <Box flexDirection={"row-reverse"} sx={{ p: 1.25, borderRadius: "lg" }}>
        {" "}
        This Box 2{" "}
      </Box>
      <Box justifyContent={"flex-end"} sx={{ p: 1.25, borderRadius: "lg" }}>
        This Box 3
      </Box>
      <Box justifyContent={"flex-end"} sx={{ p: 1.25, borderRadius: "lg" }}>
        This Box 4
      </Box>
      <Box justifyContent={"flex-end"} sx={{ p: 1.25, borderRadius: "lg" }}>
        This Box 5
      </Box>
      <Box justifyContent={"flex-end"} sx={{ p: 1.25, borderRadius: "lg" }}>
        This Box 6
      </Box>
    </Sheet>
  );
}
