import React from 'react';
import Badge, { BadgeProps } from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';
import UsersModel from '@typings/models/users';
import { userStatusToColor } from '@utils/userStatus';
import TimelapseIcon from './icons/TimelapseIcon';
import { Tooltip } from '@mui/joy';
import { computeUserAvatar } from '@utils/computeAvatar';

type AvatarWithStatusProps = AvatarProps & {
  status?: UsersModel.Models.Status;
  inset?: string;
  hide?: boolean;
  badgeProps?: BadgeProps;
  muted?: boolean;
};

export const UserAvatar: React.FC<AvatarProps> = React.forwardRef<
  HTMLDivElement,
  AvatarProps
>(({ src, ...rest }: AvatarProps, ref) => {
  return (
    <Avatar
      size="sm"
      src={src ? computeUserAvatar(src) : undefined}
      {...rest}
      ref={ref}
    />
  );
});

export default function AvatarWithStatus({
  status = UsersModel.Models.Status.Offline,
  inset = '14%',
  hide = false,
  muted = false,
  src,
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
              bgcolor: muted
                ? 'danger.400'
                : (theme) => theme.resolveVar(color),
            },
          },
        }}
        variant="solid"
        size="sm"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeInset={inset}
        badgeContent={
          muted ? (
            <Tooltip title="User was timed out" size="sm">
              <TimelapseIcon size="xs" />
            </Tooltip>
          ) : undefined
        }
        {...badgeProps}
      >
        <Avatar
          size="sm"
          {...rest}
          src={src ? computeUserAvatar(src) : undefined}
        />
      </Badge>
    </div>
  );
}
