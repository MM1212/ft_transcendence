import React from 'react';
import Badge, { BadgeProps, badgeClasses } from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';
import UsersModel from '@typings/models/users';
import { userStatusToColor } from '@utils/userStatus';
import TimelapseIcon from './icons/TimelapseIcon';
import { PaletteBackground, Tooltip } from '@mui/joy';
import { computeUserAvatar } from '@utils/computeAvatar';

type AvatarWithStatusProps = AvatarProps & {
  status?: UsersModel.Models.Status;
  inset?: string;
  hide?: boolean;
  badgeProps?: BadgeProps;
  muted?: boolean;
  background?: keyof PaletteBackground;
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

const AvatarWithStatus = React.forwardRef<
  HTMLDivElement,
  AvatarWithStatusProps
>(function AvatarWithStatus(
  {
    status = UsersModel.Models.Status.Offline,
    inset = '14%',
    hide = false,
    muted = false,
    src,
    badgeProps,
    background = 'surface',
    ...rest
  }: AvatarWithStatusProps,
  ref
) {
  const color = React.useMemo(() => userStatusToColor(status), [status]);
  return (
    <div
      style={{
        position: 'relative',
        visibility: hide ? 'hidden' : 'visible',
      }}
      ref={ref}
    >
      <Badge
        variant={
          status === UsersModel.Models.Status.Offline ? 'outlined' : 'solid'
        }
        size="sm"
        color={muted ? 'danger' : undefined}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeInset={inset}
        badgeContent={
          muted ? (
            <Tooltip title="User was timed out" size="sm">
              <TimelapseIcon size="xs" />
            </Tooltip>
          ) : undefined
        }
        sx={{
          [`--Badge-ringColor`]: (theme) =>
            theme.getCssVar(`palette-background-${background}`),
          [`& .${badgeClasses.badge}`]: {
            ['--variant-borderWidth']: (theme) => theme.spacing(0.25),
            borderColor: (theme) => theme.getCssVar(color),
            ...(status !== UsersModel.Models.Status.Offline &&
              !muted && {
                bgcolor: (theme) => theme.getCssVar(color),
              }),
          },
        }}
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
});

export default AvatarWithStatus;
