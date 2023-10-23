/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MessagesPanel.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mgranate_ls <mgranate_ls@student.42.fr>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/10/21 17:22:36 by mgranate_ls       #+#    #+#             */
/*   Updated: 2023/10/21 19:23:25 by mgranate_ls      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Input } from "@mui/joy";
import { Box, Chip, Sheet, Stack, Typography } from "@mui/joy";

type MessagesPanelProps = {
  isOpen: boolean;
};

export default function MessagesPanel({ isOpen }: MessagesPanelProps) {
  if (isOpen)
  return (
    <Sheet
      sx={{
        borderRight: '1px solid',
        borderColor: 'divider',
        height: 'calc(100dvh - var(--Header-height))',
        overflowY: 'auto',
		backgroundColor: 'background.level1',
		width: '50%',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        p={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: 'md', md: 'lg' }}
          component="h1"
          fontWeight="lg"
          endDecorator={
            <Chip
              variant="soft"
              color="primary"
              size="md"
              slotProps={{ root: { component: 'span' } }}
            >
              10
            </Chip>
          }
          sx={{ mr: 'auto' }}
        >
          Messages
        </Typography>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Input
          size="sm"
          placeholder="Search"
          aria-label="Search"
        />
      </Box>
    </Sheet>
  );
}
