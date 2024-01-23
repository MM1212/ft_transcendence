import CogIcon from '@components/icons/CogIcon';
import HumanGreetingProximityIcon from '@components/icons/HumanGreetingProximityIcon';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  FormControl,
  FormLabel,
  Input,
  InputProps,
  Sheet,
  Stack,
  Typography,
  accordionDetailsClasses,
  accordionSummaryClasses,
} from '@mui/joy';

function Tab({
  title,
  icon: Icon,
  children,
}: {
  title: React.ReactNode;
  icon: React.ComponentType;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <AccordionGroup
      variant="outlined"
      sx={{
        borderRadius: 'md',
        width: '100%',
        [`& .${accordionDetailsClasses.content}`]: {
          boxShadow: (theme) => `inset 0 1px ${theme.vars.palette.divider}`,
          [`&.${accordionDetailsClasses.expanded}`]: {
            paddingBlock: '0.75rem',
          },
        },
        [`& .${accordionSummaryClasses.root}`]: {
          transition: (theme) =>
            theme.transitions.create(['background-color', 'color']),
        },
        overflow: 'hidden',
      }}
    >
      <Accordion>
        <AccordionSummary>
          <Icon />
          {title}
        </AccordionSummary>
        <AccordionDetails variant="soft">{children}</AccordionDetails>
      </Accordion>
    </AccordionGroup>
  );
}

function FormInput({
  label,
  placeholder,
  size,
}: {
  label: React.ReactNode;
  placeholder: string;
  size: InputProps['size'];
}): JSX.Element {
  return (
    <FormControl size={size}>
      <FormLabel>{label}</FormLabel>
      <Input placeholder={placeholder} />
    </FormControl>
  );
}

export default function SettingsView(): JSX.Element {
  return (
    <Sheet
      sx={{
        height: '100%',
        width: '45dvh',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack alignItems="center" width="100%" spacing={2} p={2}>
        <Typography level="h3" alignSelf="flex-start">
          Settings
        </Typography>
        <Tab title="Lobby" icon={HumanGreetingProximityIcon}>
          <Stack direction="column" spacing={1} p={1}>
            <Typography level="body-sm" mb={1}>
              Keys
            </Typography>
            <FormInput label="Move Up" placeholder="W" size="sm" />
            <FormInput label="Move Down" placeholder="S" size="sm" />
            <FormInput label="Move Left" placeholder="A" size="sm" />
            <FormInput label="Move Right" placeholder="D" size="sm" />
            <FormInput label="Dance" placeholder="G" size="sm" />
          </Stack>
        </Tab>
        <Tab title="Pong" icon={TableTennisIcon}>
          <Stack direction="column" spacing={1} p={1}>
            <Typography level="body-sm" mb={1}>
              Keys
            </Typography>
            <FormInput label="Move Up" placeholder="W" size="sm" />
            <FormInput label="Move Down" placeholder="S" size="sm" />
            <FormInput label="Boost" placeholder="A" size="sm" />
            <FormInput label="Special Power" placeholder="A" size="sm" />
          </Stack>
        </Tab>
      </Stack>
    </Sheet>
  );
}
