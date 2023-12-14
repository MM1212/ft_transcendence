import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import { Box, Divider, Stack, Typography } from "@mui/joy";
import PlayerStatsRow from "./PlayerStatsRow";
import CurrencyTwdIcon from "@components/icons/CurrencyTwdIcon";
import SoccerIcon from "@components/icons/SoccerIcon";

export default function MatchHistoryScoreBoard() {
    const teams = [ 
        "Team 1", "Team 2"
    ]
  return (
    <>
    {teams.map((team, index) => (
        <>
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: "5fr 7fr 4fr 4fr",
            justifyItems: "left",
            p: 1,
            borderRadius: "md",
            justifyContent: "space-between",
          }}
        >
          <Typography
            style={{ display: "grid", gridColumnStart: "1", alignSelf: "left" }}
            textColor= {team === "Team 1" ? "primary.300" : "danger.400"}
          >
            {team}
          </Typography>
          <Box
            style={{
              justifySelf: "center",
              alignSelf: "center",
              display: "grid",
              gridColumnStart: "2",
            }}
          >
            <Stack
              gap={1.5}
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <Typography textColor={"primary.300"}>Paddle</Typography>
            </Stack>
          </Box>
          <Box
            style={{  justifySelf: "right", display: "grid", gridColumnStart: "3"}}
          >
            <Stack
              gap={1.5}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography textColor= {team === "Team 1" ? "primary.300" : "danger.400"}>9</Typography>
              <SoccerIcon />
            </Stack>
          </Box>
          <Box
            style={{ justifySelf: "right", display: "grid", gridColumnStart: "4", alignSelf: "left" }}
          >
            <Stack
              gap={1.5}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography textColor= {team === "Team 1" ? "primary.300" : "danger.400"}>30,468 </Typography>
              <CurrencyTwdIcon />
            </Stack>
          </Box>
        </Stack>
        <PlayerStatsRow id={12} />
        <PlayerStatsRow id={3} />
        <Divider />
        </>
        ))}
        {/* <Stack
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography textColor={"danger.400"}>Team 2</Typography>
          <Typography textColor={"danger.400"}>Paddle</Typography>
          <Box
            gap={1.5}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Typography textColor={"danger.400"}>20,268 </Typography>
            <CurrencyTwdIcon />
          </Box>
        </Stack>
        <PlayerStatsRow id={2} />
        <PlayerStatsRow id={5} /> */}
    </>
  );
}
