import useFriend from '@apps/Friends/hooks/useFriend';
import { useUser } from '@hooks/user';
import { Divider, Typography } from '@mui/joy';
import { fourth } from '../styles';

const ordinals = new Intl.PluralRules('en', { type: 'ordinal' });

const suffixes = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

const formatToOrdinal = (n: number): string => {
  const category = ordinals.select(n);
  const suffix = suffixes[category as keyof typeof suffixes];
  return `${n}${suffix}`;
};

export default function LeaderBoardUser({
  name,
  points,
  position,
}: {
  position: number;
  name: string;
  points: number;
}) {
  return (
    <>
      <Typography
        level="h3"
        sx={{
          gridColumnStart: '1',
          py: 1,
        }}
      >
        {formatToOrdinal(position)}
      </Typography>
      <Typography
        level="title-md"
        sx={{
          gridColumnStart: '2',
          py: 1,
        }}
      >
        {name}
      </Typography>
      <Typography
        style={fourth}
        sx={{
          py: 1,
        }}
      >
        {points}
      </Typography>
      {/* // </Stack> */}
      <Divider
        style={{
          gridColumnStart: 1,
          gridColumnEnd: 'span 4',
        }}
      />
    </>
  );
}
