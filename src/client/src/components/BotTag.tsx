import { Chip, type ChipProps } from '@mui/joy';

export default function BotTag(props: ChipProps) {
  return (
    <Chip
      variant="solid"
      color="primary"
      size="sm"
      sx={{
        borderRadius: 'sm',
      }}
      {...props}
    >
      {props.children ?? 'BOT'}
    </Chip>
  );
}
