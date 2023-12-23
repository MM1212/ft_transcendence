import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
  accordionDetailsClasses,
  accordionSummaryClasses,
} from "@mui/joy";
import SingleMatchHist from "./SingleMatchHist";
import UsersModel from "@typings/models/users";
import MatchHistoryScoreBoard from "@apps/MatchHistory/components/MatchHistoryScoreBoard";

export default function UserMatchHistory({
  users,
}: {
  users: UsersModel.Models.IUserInfo[];
}) {
  return (
    <Box overflow="auto" height="100%" width="100%">
      {users.map((user, index) => (
        <>
          <AccordionGroup
            variant="outlined"
            sx={{
              borderRadius: "md",
              width: "100%",
              [`& .${accordionDetailsClasses.content}`]: {
                boxShadow: (theme) =>
                  `inset 0 1px ${theme.vars.palette.divider}`,
                [`&.${accordionDetailsClasses.expanded}`]: {
                  paddingBlock: "0.75rem",
                },
              },
              [`& .${accordionSummaryClasses.root}`]: {
                transition: (theme) =>
                  theme.transitions.create(["background-color", "color"]),
              },
              overflow: "hidden",
            }}
          >
            <Accordion>
              <AccordionSummary key={index}>
                <SingleMatchHist />
              </AccordionSummary>
              <AccordionDetails variant="soft" key={index}>
                <MatchHistoryScoreBoard />
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </>
      ))}
    </Box>
  );
}
