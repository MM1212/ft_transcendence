import React from 'react';
import Badge from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';
import UsersModel from '@typings/models/users';
import { ColorPaletteProp } from '@mui/joy';

type AvatarWithStatusProps = AvatarProps & {
  status?: UsersModel.Models.Status;
  inset?: string;
  hide?: boolean;
};

export default function AvatarWithStatus({
  status = UsersModel.Models.Status.Offline,
  inset = '.25rem',
  hide = false,
  ...rest
}: AvatarWithStatusProps) {
  const color = React.useMemo<ColorPaletteProp>(() => {
    switch (status) {
      case UsersModel.Models.Status.Online:
        return 'success';
      case UsersModel.Models.Status.Away:
        return 'warning';
      case UsersModel.Models.Status.Busy:
        return 'danger';
      default:
        return 'neutral';
    }
  }, [status]);
  return (
    <div
      style={{
        position: 'relative',
        visibility: hide ? 'hidden' : 'visible',
      }}
    >
      <Badge
        color={color}
        variant="solid"
        size="sm"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeInset={inset}
      >
        <Avatar size="sm" {...rest} />
      </Badge>
    </div>
  );
}
