import { GlobalStyles } from "@mui/joy";

export default function CustomScrollBar() {
  return (
    <GlobalStyles
      styles={(theme) => `
				::-webkit-scrollbar {
					width: 0.5rem;
					background-color: transparent;
				}
				::-webkit-scrollbar-thumb {
					background-color: ${theme.palette.background.level3};
					border-radius: ${theme.radius.lg};
				}
				::-webkit-scrollbar-track {
					background-color: ${theme.palette.background.level1};
				}
			`}
    />
  );
}
