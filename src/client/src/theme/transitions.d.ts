import { Theme as JoyTheme } from '@mui/joy';

interface TransitionAPIDurations {
  readonly shortest: number;
  readonly shorter: number;
  readonly short: number;
  readonly standard: number;
  readonly complex: number;
  readonly enteringScreen: number;
  readonly leavingScreen: number;
}

interface TransitionAPIEasing {
  readonly easeInOut: string;
  readonly easeOut: string;
  readonly easeIn: string;
  readonly sharp: string;
}

interface TransitionAPIOptions {
  duration?: string | number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out' | 'ease';
  delay?: string | number;
}

// based on @mui/material
interface TransitionAPI {
  readonly duration: TransitionAPIDurations;
  readonly easing: TransitionAPIEasing;
  create: (props: string | string[], options?: TransitionAPIOptions) => string;
  getAutoHeightDuration: (height: number) => number;
}

declare module '@mui/joy' {
  interface Theme {
    transitions: TransitionAPI;
  }
  // allow configuration using `createTheme`
  interface CssVarsThemeOptions {
    transitions?: Partial<TransitionAPI>;
  }
}