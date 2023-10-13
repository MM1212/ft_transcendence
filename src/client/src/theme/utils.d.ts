import { Theme, ThemeCssVar } from '@mui/joy';

interface UtilsAPI {
  resolveVar: (variable: ThemeCssVar) => string;
}

declare module '@mui/joy' {
  interface Theme extends UtilsAPI {}
  // allow configuration using `createTheme`
  interface CssVarsThemeOptions extends UtilsAPI {}
}
