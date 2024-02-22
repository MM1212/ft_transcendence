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
import { useSetting, useSettingValue } from '../hooks';
import {
  keySettingsDefault,
  type KeySettings,
  type KeySettingsKey,
} from '../state';

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
  const [keySettings, setKeySettings] = useSetting<KeySettings>('keySettings');
  const usedKeys = new Set<string>(Object.values(keySettings));
  console.log('usedKeys', usedKeys);

  return (
    <FormControl size={size}>
      <FormLabel>{label}</FormLabel>
      <Input
        defaultValue={placeholder.toUpperCase()}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (event.target.value === '') return;
          const inputKey =
            event.target.value[event.target.value.length - 1].toLowerCase();
          event.target.value = inputKey.toUpperCase();
          if (
            inputKey != keySettings[label as KeySettingsKey] &&
            usedKeys.has(inputKey)
          ) {
            console.log(inputKey, ' is already being used');
            event.target.value = 'Key Already In Use'.toLowerCase();
            return;
          }
          usedKeys.delete(keySettings[label as KeySettingsKey]);
          const tmpKeySettings = { ...keySettings };
          tmpKeySettings[label as KeySettingsKey] = inputKey;
          console.log(tmpKeySettings);
          setKeySettings(tmpKeySettings);
          usedKeys.add(inputKey);
        }}
      />
    </FormControl>
  );
}

export default function SettingsView(): JSX.Element {
  // const [keySettings, setKeySettings] = useSetting<KeySettings>('keySettings');
  // if (!keySettings) setKeySettings(keySettingsDefault);
  let keySettings = useSettingValue<KeySettings>('keySettings');
  if (!keySettings) keySettings = keySettingsDefault;

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
            {Object.keys(keySettings).map((key) => {
              return (
                <FormInput
                  key={key}
                  label={key}
                  placeholder={keySettings[key as KeySettingsKey].toUpperCase()}
                  size="sm"
                />
              );
            })}
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
