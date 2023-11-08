import React from 'react';
import Badge, { BadgeProps } from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';
import UsersModel from '@typings/models/users';
import { userStatusToColor } from '@utils/userStatus';

type AvatarWithStatusProps = AvatarProps & {
  status?: UsersModel.Models.Status;
  inset?: string;
  hide?: boolean;
  badgeProps?: BadgeProps;
};

export default function AvatarWithStatus({
  status = UsersModel.Models.Status.Offline,
  inset = '14%',
  hide = false,
  badgeProps,
  ...rest
}: AvatarWithStatusProps) {
  const color = React.useMemo(() => userStatusToColor(status), [status]);
  return (
    <div
      style={{
        position: 'relative',
        visibility: hide ? 'hidden' : 'visible',
      }}
    >
      <Badge
        slotProps={{
          badge: {
            sx: {
              bgcolor: (theme) => theme.resolveVar(color),
            },
          },
        }}
        variant="solid"
        size="sm"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeInset={inset}
        {...badgeProps}
      >
        <Avatar size="sm" {...rest} />
      </Badge>
    </div>
  );
}
