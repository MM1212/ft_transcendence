import { Chip, type ChipProps } from '@mui/joy';
import RobotIcon from './icons/RobotIcon';

export default function BotTag({
  icon,
  ...props
}: ChipProps & { icon?: boolean }) {
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
      {props.children ?? (icon ? <RobotIcon /> : 'BOT')}
    </Chip>
  );
}
