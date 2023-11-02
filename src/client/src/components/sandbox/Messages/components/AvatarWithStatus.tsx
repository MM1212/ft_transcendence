import React from 'react';
import Badge from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';

type AvatarWithStatusProps = AvatarProps & {
  online?: boolean;
  inset?: string;
};

export default function AvatarWithStatus({
  online = false,
  inset = '.25rem',
  ...rest
}: AvatarWithStatusProps) {
  return (
    <div>
      <Badge
        color={online ? 'success' : 'neutral'}
        variant={online ? 'solid' : 'soft'}
        size="sm"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeInset={inset}
      >
        <Avatar size="sm" {...rest} />
      </Badge>
    </div>
  );
}