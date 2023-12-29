import Link from '@components/Link';
import { Radius, Typography, styled } from '@mui/joy';
import React from 'react';

export const InboxMessageInjection = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'radius',
})<{
  radius?: keyof Radius;
}>(({ theme, radius = 'sm' }) => ({
  borderRadius: theme.radius[radius],
})) as typeof Typography;

export function InboxMessageInjectionRoute({
  path,
  label,
  ...rest
}: {
  path: string;
  label: string;
} & React.ComponentProps<typeof InboxMessageInjection> & {
    radius?: keyof Radius;
  }) {
  return (
    <InboxMessageInjection
      component={Link}
      href={path}
      variant="soft"
      color="primary"
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      {...(rest as any)}
    >
      {label}
    </InboxMessageInjection>
  );
}
