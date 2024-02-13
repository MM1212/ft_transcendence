import type { UsePaginationItem } from '@hooks/usePagination';
import type { ButtonProps, ColorPaletteProp, VariantProp } from '@mui/joy';
import type { SxProps } from '@mui/joy/styles/types';

export interface PaginationProps {
  boundaryCount?: number;
  color?: ColorPaletteProp;
  count: number;
  defaultPage?: number;
  disabled?: boolean;
  hideNextButton?: boolean;
  hidePrevButton?: boolean;
  onChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  page?: number;
  renderItem?: (props: PaginationItemProps) => React.ReactNode;
  variant?: VariantProp;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  siblingCount?: number;
  size?: ButtonProps['size'];
  sx?: SxProps;
}

export interface PaginationItemProps extends UsePaginationItem {
  color: PaginationProps['color'];
  size: PaginationProps['size'];
  variant: PaginationProps['variant'];
  key?: any;
}