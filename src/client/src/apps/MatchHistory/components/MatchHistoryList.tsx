import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  CircularProgress,
} from '@mui/joy';
import MatchHistoryScoreBoard from '@apps/MatchHistory/components/MatchHistoryScoreBoard';
import MatchHistoryEntry from './MatchHistoryEntry';
import useQuery from '@hooks/useQuery';
import React, { memo, useEffect } from 'react';
import PongHistoryModel from '@typings/models/pong/history';
import { useTunnelEndpoint } from '@hooks/tunnel';
import { Typography } from '@mui/joy';

const Entry = memo(function Entry({
  selected,
  setSelected,
  ...match
}: PongHistoryModel.Models.Match & {
  targetId: number;
  selected: boolean;
  setSelected: (
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean,
    id: number
  ) => void;
}) {
  const firstMount = React.useRef(true);

  React.useLayoutEffect(() => {
    firstMount.current = false;
  }, []);
  return (
    <Accordion
      id={`profile-match-history-${match.id}`}
      expanded={selected}
      onChange={(ev, expanded) => setSelected(ev, expanded, match.id)}
    >
      <AccordionSummary>
        <MatchHistoryEntry size={5} {...match} />
      </AccordionSummary>
      <AccordionDetails>
        {!firstMount.current && <MatchHistoryScoreBoard />}
      </AccordionDetails>
    </Accordion>
  );
});

export default function MatchHistoryList({ targetId }: { targetId: number }) {
  const { match_id } = useQuery<{ match_id: string }>();
  const ref = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!match_id || isNaN(parseInt(match_id))) return;
    const target = document.getElementById(`profile-match-history-${match_id}`);
    if (!target) return;
    setSelected(parseInt(match_id));

    setTimeout(() => {
      const target = document.getElementById(
        `profile-match-history-${match_id}`
      );
      if (!target) return;
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 350);
  }, [match_id]);

  const onAccordionClick = React.useCallback<
    (
      event: React.SyntheticEvent<Element, Event>,
      expanded: boolean,
      id: number
    ) => void
  >(
    (event, expanded, id) => {
      const target = event.currentTarget;
      if (expanded)
        setTimeout(() => {
          target.parentElement?.parentElement?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 350);
      setSelected(expanded ? id : null);
    },
    [setSelected]
  );
  const { isLoading, error, data, isValidating } =
    useTunnelEndpoint<PongHistoryModel.Endpoints.GetAllByUserId>(
      PongHistoryModel.Endpoints.Targets.GetAllByUserId,
      {
        id: targetId,
      }
    );
  return (
    <Box overflow="auto" height="100%" width="100%" ref={ref}>
      {isLoading || isValidating ? (
        <CircularProgress variant="plain" />
      ) : !data || error ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1}
          p={1}
        >
          <Typography color="danger" level="title-md">
            {error?.toString() ?? 'No data found'}
          </Typography>
        </Box>
      ) : (
        <AccordionGroup>
          {data.map((match) => (
            <Entry
              key={match.id}
              {...match}
              targetId={targetId}
              selected={selected === match.id}
              setSelected={onAccordionClick}
            />
          ))}
        </AccordionGroup>
      )}
    </Box>
  );
}
