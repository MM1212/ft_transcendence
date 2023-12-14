import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Divider,
  Stack,
  Typography,
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
          <AccordionGroup>
            <Accordion >
              <AccordionSummary key={index}>
                <SingleMatchHist />
              </AccordionSummary>
              <AccordionDetails key={index}> <MatchHistoryScoreBoard/></AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </>
      ))}
    </Box>
  );
}
