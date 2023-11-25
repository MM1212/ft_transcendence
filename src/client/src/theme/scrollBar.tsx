import { GlobalStyles } from '@mui/joy';

export default function CustomScrollBar() {
  return (
    <GlobalStyles
      styles={(theme) => `
				::-webkit-scrollbar {
					width: 0.5rem;
					background-color: transparent;
          transition: ${theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
          })}
          cursor: pointer;
				}
				::-webkit-scrollbar-thumb {
					background-color: ${theme.palette.background.level3};
					border-radius: ${theme.radius.lg};
          cursor: pointer;
				}
				::-webkit-scrollbar-track {
          display: none;
          padding: ${theme.spacing(1)};
          background-color: ${theme.palette.background.level1};
				}
        ::-webkit-scrollbar-track:hover {
          display: block;
        }
			`}
    />
  );
}
