import { Theme, ThemeCssVar, extendTheme } from '@mui/joy';
import { TransitionAPI } from './transitions';
import { alpha, lighten, darken } from './bin/color';
export * from './scrollBar';

const transitionConstants: Pick<TransitionAPI, 'duration' | 'easing'> = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

function resolveVar(this: Theme, variable: ThemeCssVar): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    `--${this.cssVarPrefix ? `${this.cssVarPrefix}-` : ''}${variable}`
  );
  if (!value) {
    console.warn(`CSS variable ${variable} is not defined`);
    return '';
  }
  return value.trim();
}

const testTheme = extendTheme({
  transitions: {
    ...transitionConstants,
    create: (props, options = {}) => {
      if (!props) return '';
      const {
        duration = transitionConstants.duration.standard,
        easing = transitionConstants.easing.easeInOut,
        delay = 0,
      } = options;
      if (!Array.isArray(props)) props = [props];
      return props
        .map(
          (prop) =>
            `${prop} ${
              typeof duration === 'number' ? `${duration}ms` : duration
            } ${easing} ${typeof delay === 'number' ? `${delay}ms` : delay}`
        )
        .join(', ');
    },
  } as TransitionAPI,
  resolveVar,
  alpha,
  lighten,
  darken,
  breakpoints: {
    values: {
      xs: 300,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    }
  },

  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(
            ['background-color', 'transform', 'box-shadow', 'border'],
            {
              duration: theme.transitions.duration.shortest,
            }
          ),
        }),
      },
    },
    JoyIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(
            ['background-color', 'transform', 'box-shadow', 'border'],
            {
              duration: theme.transitions.duration.shortest,
            }
          ),
        }),
      },
    },
    JoySvgIcon: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.size === 'xs' && {
            fontSize: theme.fontSize.xs,
          }),
          ...(ownerState.size === 'xxs' && {
            fontSize: '0.50rem',
          }),
          ...(ownerState.size === 'xl' && {
            fontSize: theme.fontSize.xl,
          }),
        }),
      },
    },
    JoyTooltip: {
      defaultProps: {
        placement: 'top',
        arrow: true,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    JoyMenuItem: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'danger' &&
            ownerState.variant === 'plain' && {
              color: theme.palette.danger[400],
            }),
          transition: theme.transitions.create(
            ['background-color', 'transform', 'box-shadow', 'border'],
            {
              duration: theme.transitions.duration.shortest,
            }
          ),
        }),
      },
    },
    JoyChip: {
      styleOverrides: {
        label: {
          display: 'inline-flex',
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        viewBox: '0 0 23 23',
      },
    },
    JoyModal: {
      styleOverrides: {
        backdrop: ({ theme }) => ({
          ...(import.meta.env.DEV && {
            backdropFilter: 'none !important',
            backgroundColor: alpha(
              theme.resolveVar('palette-background-level1'),
              0.5
            ),
          }),
        }),
      },
    },
    JoyDrawer: {
      styleOverrides: {
        backdrop: ({ theme }) => ({
          ...(import.meta.env.DEV && {
            backdropFilter: 'none !important',
            backgroundColor: alpha(
              theme.resolveVar('palette-background-level1'),
              0.5
            ),
          }),
        }),
      },
    },
    JoyCircularProgress: {
      defaultProps: {
        variant: 'plain',
      },
    },
    JoyModalDialog: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          ...(ownerState.maxWidth === 'xs' && {
            maxWidth: theme.breakpoints.values.xs,
          }),
          ...(ownerState.minWidth === 'xs' && {
            minWidth: theme.breakpoints.values.xs,
          }),
        }),
      },
    },
  },
});

testTheme.gradients = {
  primary: `linear-gradient(45deg, ${testTheme.palette.primary.solidBg}, ${testTheme.palette.primary.softBg})`,
  success: `linear-gradient(45deg, ${testTheme.palette.success.solidBg}, ${testTheme.palette.success.softBg})`,
  warning: `linear-gradient(45deg, ${testTheme.palette.warning.solidBg}, ${testTheme.palette.warning.softBg})`,
  danger: `linear-gradient(45deg, ${testTheme.palette.danger.solidBg}, ${testTheme.palette.danger.softBg})`,
  neutral: `linear-gradient(45deg, ${testTheme.palette.neutral.solidBg}, ${testTheme.palette.neutral.softBg})`,
  background: `linear-gradient(45deg, ${testTheme.vars.palette.background.level1} 0%, ${testTheme.vars.palette.background.surface} 100%)`,
};

export { alpha, lighten, darken };
export default testTheme;
