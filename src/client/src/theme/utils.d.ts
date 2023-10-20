import { Theme, ThemeCssVar } from '@mui/joy';

interface UtilsAPI {
  resolveVar: (variable: ThemeCssVar) => string;
  alpha: (colorCode: string, delta: number) => string;
  lighten: (colorCode: string, delta: number) => string;
  darken: (colorCode: string, delta: number) => string;
}

declare module '@mui/joy' {
  interface Theme extends UtilsAPI {}
  // allow configuration using `createTheme`
  interface CssVarsThemeOptions extends UtilsAPI {}
}
