/* eslint-disable @typescript-eslint/no-unused-vars */
import ChevronRightIcon from '@components/icons/ChevronRightIcon';
import type { PaginationItemProps, PaginationProps } from './types';
import usePagination from '@hooks/usePagination';
import { Button, IconButton, Stack, Typography } from '@mui/joy';
import ChevronLeftIcon from '@components/icons/ChevronLeftIcon';
import ChevronDoubleLeftIcon from '@components/icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from '@components/icons/ChevronDoubleRightIcon';

function PaginationItem(props: PaginationItemProps): JSX.Element | null {
  console.log('PaginationItem', props);

  switch (props.type) {
    case 'start-ellipsis':
    case 'end-ellipsis':
      return (
        <Typography key={props.type} level={`body-${props.size ?? 'md'}`}>
          ...
        </Typography>
      );
    case 'page':
      return (
        <Button
          {...props}
          key={props.page}
          sx={{
            ...(props.selected && {
              bgcolor: `${props.color}.${props.variant}ActiveBg`,
              '&:hover': {
                bgcolor: `${props.color}.${props.variant}ActiveBg`,
              },
            }),
            transition: (theme) => theme.transitions.create('background-color'),
          }}
        >
          {props.page}
        </Button>
      );
    case 'next':
      return (
        <IconButton
          {...props}
          key={props.type}
          sx={{
            ...(props.disabled && {
              bgcolor: `${props.color}.${props.variant}Bg`,
            }),
            transition: (theme) => theme.transitions.create('background-color'),
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      );
    case 'previous':
      return (
        <IconButton
          {...props}
          key={props.type}
          sx={{
            ...(props.disabled && {
              bgcolor: `${props.color}.${props.variant}Bg`,
            }),
            transition: (theme) => theme.transitions.create('background-color'),
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
      );
    case 'first':
      return (
        <IconButton
          {...props}
          key={props.type}
          sx={{
            ...(props.disabled && {
              bgcolor: `${props.color}.${props.variant}Bg`,
            }),
            transition: (theme) => theme.transitions.create('background-color'),
          }}
        >
          <ChevronDoubleLeftIcon />
        </IconButton>
      );
    case 'last':
      return (
        <IconButton
          {...props}
          key={props.type}
          sx={{
            ...(props.disabled && {
              bgcolor: `${props.color}.${props.variant}Bg`,
            }),
            transition: (theme) => theme.transitions.create('background-color'),
          }}
        >
          <ChevronDoubleRightIcon />
        </IconButton>
      );
  }
}

export default function Pagination(props: PaginationProps) {
  const {
    boundaryCount = 1,
    color = 'primary',
    count = 1,
    defaultPage = 1,
    disabled = false,
    hideNextButton = false,
    hidePrevButton = false,
    onChange,
    page,
    renderItem = (props) => <PaginationItem {...props} />,
    variant = 'outlined',
    showFirstButton = false,
    showLastButton = false,
    siblingCount = 1,
    size = 'md',
    ...other
  } = props;

  const { items } = usePagination(props);

  return (
    <Stack direction="row" alignItems="center" spacing={1} {...other}>
      {items.map((item, index) => {
        return renderItem({
          ...item,
          color,
          disabled,
          key: index,
          size,
          variant,
        });
      })}
    </Stack>
  );
}
