import { Sheet, Box, Typography } from '@mui/joy';
import type React from 'react';
import { Link } from 'wouter';

export default function GenericPlaceholder({
  title,
  label,
  icon,
  path,
  centerVertical = false,
}: {
  title: React.ReactNode;
  label?: React.ReactNode;
  icon: React.ReactNode;
  path?: string;
  centerVertical?: boolean;
}) {
  return (
    <Box
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={centerVertical ? '80%' : 'fit-content'}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: '60%',
          height: 'fit-content',
          borderRadius: 'sm',
          maxWidth: '80%',
          my: 2,
        }}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={1}
          p={4}
        >
          {icon}
          <Typography level="body-md" textAlign="center">
            {title}
          </Typography>
          {path ? (
            <Typography
              component={Link}
              to={path}
              level="body-xs"
              textAlign="center"
            >
              {label}
            </Typography>
          ) : (
            label && (
              <Typography level="body-xs" textAlign="center">
                {label}
              </Typography>
            )
          )}
        </Box>
      </Sheet>
    </Box>
  );
}
