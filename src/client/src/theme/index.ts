import { Theme, ThemeCssVar, extendTheme } from "@mui/joy";
import { TransitionAPI } from "./transitions";

const transitionConstants: Pick<TransitionAPI, "duration" | "easing"> = {
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
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
};

function resolveVar(this: Theme, variable: ThemeCssVar): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(
    `--${this.cssVarPrefix ? `${this.cssVarPrefix}-` : ""}${variable}`
  );
  if (!value) {
    console.warn(`CSS variable ${variable} is not defined`);
    return "";
  }
  return value.trim();
}

const testTheme = extendTheme({
  transitions: {
    ...transitionConstants,
    create: (props, options) => {
      if (!props) return "";
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
              typeof duration === "number" ? `${duration}ms` : duration
            } ${easing} ${typeof delay === "number" ? `${delay}ms` : delay}`
        )
        .join(", ");
    },
  } as TransitionAPI,
  resolveVar,
  components: {
    JoyButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(
            ["background-color", "transform", "box-shadow", "border"],
            {
              duration: theme.transitions.duration.shortest,
            }
          ),
        }),
      },
    },
  },
});

export default testTheme;
