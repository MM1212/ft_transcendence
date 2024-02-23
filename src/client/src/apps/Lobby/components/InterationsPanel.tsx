import { Box, Typography } from '@mui/joy';
import { useLobbyShowingInteractions } from '../hooks';

export default function LobbyInteractionsPanel(): JSX.Element | null {
  const interactions = useLobbyShowingInteractions();
  if (interactions.length === 0) return null;
  return (
    <Box
      sx={{
        backgroundColor: 'background.level1',
        borderRadius: 'sm',
      }}
      position="absolute"
      bottom={0}
      right={0}
      m={1}
      display="flex"
      flexDirection="column-reverse"
      gap={1}
      p={1}
      minWidth="20dvh"
    >
      {interactions.map((interaction) => (
        <Box
          key={interaction.id}
          width="100%"
          display="flex"
          // flexDirection="row-reverse"
          justifyContent="space-between"
          gap={2}
          alignItems="center"
        >
          <Typography
            level="title-lg"
            textColor="common.white"
            sx={{
              textShadow: '0 0 .2vh rgba(0, 0, 0, 0.6)',
            }}
          >
            {interaction.label}
          </Typography>
          <Box
            height="3.5dvh"
            minWidth="3.5dvh"
            p={1}
            borderRadius="lg"
            bgcolor="common.white"
            display="flex"
            justifyContent="center"
            alignItems="center"
            boxShadow="inset -0.2vh -0.2vh 0 0.2vh #cecece, 0 0.6vh 2vh 0 rgba(0, 0, 0, 0.19)"
            mr={1}
          >
            <Typography
              level="title-lg"
              component="kbd"
              fontWeight="bold"
              textTransform="uppercase"
              textColor="common.black"
            >
              {interaction.keyDisplay}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
