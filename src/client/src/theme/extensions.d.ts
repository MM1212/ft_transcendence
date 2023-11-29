import { SvgIconPropsSizeOverrides, AvatarPropsSizeOverrides } from '@mui/joy';

declare module '@mui/joy' {
  interface SvgIconPropsSizeOverrides {
    xxs: true;
    xs: true;
    xl: true;
  }

  interface AvatarPropsSizeOverrides {
    xl: true;
  }
}
