import { Box, Button } from "@mui/joy";

import publicPath from "@utils/public";
import { Modal, Sheet, Typography } from "@mui/joy";
import BugIcon from "@components/icons/BugIcon";
import { navigate } from "wouter/use-location";

function ErrorModal({ stack }: { stack?: string }) {
  return (
    <Modal
      open={true}
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="soft"
        sx={{
          minWidth: "25vw",
          display: "flex",
          flexDirection: "column",
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "md",
          gap: 2,
          p: 3,
          boxShadow: "lg",
          backgroundColor: "background.surface",
        }}
      >
        <Typography
          textAlign="center"
          level="h3"
          startDecorator={<BugIcon fontSize="xl4" />}
        >
          An unexpected error occurred
        </Typography>
        <Sheet
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: "md",
            bgcolor: "background.level1",
          }}
        >
          <Typography
            component="pre"
            level="body-xs"
            color="danger"
            variant="plain"
          >
            {stack ?? "No stack trace available"}
          </Typography>
        </Sheet>
        <Typography level="body-xs">
          We&apos;ve collected some information about this session to help us
          fix the issue.
        </Typography>
        <Button
          variant="soft"
          color="neutral"
          onClick={() => {
            navigate("/", { replace: true });
            window.location.reload();
          }}
        >
          Return to the home page
        </Button>
      </Sheet>
    </Modal>
  );
}

export default function ErrorPage({ stack }: { stack?: string }) {
  return (
    <Box
      style={{
        width: "100dvw",
        height: "100dvh",
        backgroundImage: `url(${publicPath("/loginPage.webp")})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <ErrorModal stack={stack} />
    </Box>
  );
}
