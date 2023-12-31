import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
} from '@mui/joy';
import MatchHistoryScoreBoard from '@apps/MatchHistory/components/MatchHistoryScoreBoard';
import MatchHistoryEntry from './MatchHistoryEntry';
import useQuery from '@hooks/useQuery';
import React, { memo, useEffect } from 'react';

const Entry = memo(function Entry({
  id,
  selected,
  setSelected,
}: {
  id: number;
  selected: boolean;
  setSelected: (
    event: React.SyntheticEvent<Element, Event>,
    expanded: boolean,
    id: number
  ) => void;
}) {
  return (
    <Accordion
      id={`profile-match-history-${id}`}
      expanded={selected}
      onChange={(ev, expanded) => setSelected(ev, expanded, id)}
    >
      <AccordionSummary>
        <MatchHistoryEntry />
      </AccordionSummary>
      <AccordionDetails>
        <MatchHistoryScoreBoard />
      </AccordionDetails>
    </Accordion>
  );
});

export default function MatchHistoryList() {
  const { match_id } = useQuery<{ match_id: string }>();
  const ref = React.useRef<HTMLDivElement>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    if (!match_id || isNaN(parseInt(match_id))) return;
    setSelected(parseInt(match_id));
    const target = document.getElementById(`profile-match-history-${match_id}`);
    if (!target) return;
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
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
  return (
    <Box overflow="auto" height="100%" width="100%" ref={ref}>
      <AccordionGroup>
        {[...new Array(20)].map((_, index) => (
          <Entry
            key={index}
            id={index}
            selected={selected === index}
            setSelected={onAccordionClick}
          />
        ))}
      </AccordionGroup>
    </Box>
  );
}
