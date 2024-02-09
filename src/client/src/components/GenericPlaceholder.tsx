import { Sheet, Box, Typography } from '@mui/joy';
import type React from 'react';
import { Link } from 'wouter';

export default function GenericPlaceholder({
  title,
  label,
  icon,
  path,
}: {
  title: React.ReactNode;
  label?: React.ReactNode;
  icon: React.ReactNode;
  path?: string;
}) {
  return (
    <Sheet
      variant="outlined"
      sx={{ width: '60%', borderRadius: 'sm', maxWidth: '80%' }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={1}
        p={4}
      >
        {icon}
        <Typography level="body-md">{title}</Typography>
        {path ? (
          <Typography component={Link} to={path} level="body-xs">
            {label}
          </Typography>
        ) : (
          <Typography level="body-xs">{label}</Typography>
        )}
      </Box>
    </Sheet>
  );
}
