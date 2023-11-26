import { Checkbox, Sheet, Stack } from '@mui/joy';
import { ChatSelectEntryProps } from '../state/types';
import React from 'react';

export default function ChatSelectEntryWrapper({
  selected,
  multiple,
  children,
  toggle,
}: React.PropsWithChildren<
  Pick<ChatSelectEntryProps, 'selected' | 'multiple' | 'toggle'>
>): JSX.Element {
  return (
    <Stack
      component={Sheet}
      direction="row"
      alignItems="center"
      spacing={1}
      p={1}
      sx={{
        borderRadius: 'md',
        width: '100%',
        backgroundColor: selected ? 'background.level2' : undefined,
        transition: (theme) =>
          theme.transitions.create('background-color', {
            duration: theme.transitions.duration.shortest,
          }),
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: selected ? 'background.level2' : 'background.level1',
        },
      }}
      onClick={toggle}
    >
      {children}
      {multiple && (
        <Checkbox
          checked={selected}
          onChange={ev => {
            ev.stopPropagation();
            toggle();
          }}
          variant="outlined"
          onClick={ev => ev.stopPropagation()}
          style={{
            marginLeft: 'auto',
          }}
        />
      )}
    </Stack>
  );
}
