import { SvgIconPropsSizeOverrides, AvatarPropsSizeOverrides, FontFamilyOverrides, TypographySystemOverrides, IconButtonPropsSizeOverrides } from '@mui/joy';

declare module '@mui/joy' {
  interface SvgIconPropsSizeOverrides {
    xxs: true;
    xs: true;
    xl: true;
  }

  interface AvatarPropsSizeOverrides {
    xl: true;
  }

  interface FontFamilyOverrides {
    text: true;
  }

  interface TypographySystemOverrides {
    'title-xs': true;
    'text-xl': true;
    'text-lg': true;
    'text-md': true;
    'text-sm': true;
    'text-xs': true;
  }

  interface IconButtonPropsSizeOverrides {
    xs: true;
  }
}
