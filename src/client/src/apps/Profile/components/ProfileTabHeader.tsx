import Link from '@components/Link';
import { Box, Button, Typography } from '@mui/joy';
import React from 'react';

export default function ProfileTabHeader({
  title,
  moreContent,
  path,
}: {
  title: React.ReactNode;
  moreContent?: React.ReactNode;
  path: string;
}) {
  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={1}
    >
      <Typography level="h2">{title}</Typography>
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        component={Link}
        to={path}
      >
        {moreContent ?? 'More'}
      </Button>
    </Box>
  );
}
