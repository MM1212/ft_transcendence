import { Sheet } from '@mui/joy';

export default function CustomizationBox({
  flex = 1,
  onClick,
  imageUrl,
  selected,
  children,
  disabled = false,
}: {
  disabled?: boolean;
  imageUrl?: string;
  selected?: boolean;
  flex?: number;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 1,
        aspectRatio: '1/1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: !disabled ? 'pointer' : undefined,
        bgcolor: selected && !disabled ? 'background.level2' : undefined,
        borderRadius: (theme) => theme.radius.sm,
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover': !disabled
          ? {
              bgcolor: 'background.level1',
            }
          : undefined,
      }}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          style={{
            flex,
            width: 'auto',
            height: 'auto',
            maxHeight: '100%',
            maxWidth: '100%',
          }}
        />
      ) : (
        children
      )}
    </Sheet>
  );
}
