import {Theme as JoyTheme} from '@mui/joy';

interface Gradients {
  readonly primary: string;
  readonly success: string;
  readonly warning: string;
  readonly danger: string;
  readonly neutral: string;
  readonly background: string;
}

declare module '@mui/joy' {
  interface Theme {
    gradients: Gradients;
  }
  // allow configuration using `createTheme`
  interface CssVarsThemeOptions {
    gradients?: Partial<Gradients>;
  }
}