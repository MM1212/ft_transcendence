import { useRecoilState } from 'recoil';
import chatsState from '../state';
import React from 'react';
import { Input, InputProps } from '@mui/joy';
import MagnifyIcon from '@components/icons/MagnifyIcon';
import { useDebounce } from '@hooks/lodash';

export default function ChatsInput(props: Partial<InputProps>): JSX.Element {
  const [search, setSearch] = useRecoilState(chatsState.searchFilter);
  const [input, setInput] = React.useState(search);

  const syncInput = useDebounce(setSearch, 500, []);
  const updateInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      syncInput(e.target.value);
    },
    [syncInput]
  );
  return React.useMemo(
    () => (
      <Input
        size="sm"
        startDecorator={<MagnifyIcon />}
        placeholder="Search"
        aria-label="Search"
        {...props}
        value={input}
        onChange={updateInput}
      />
    ),
    [input, props, updateInput]
  );
}
