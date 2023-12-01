import { Sheet } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import React from 'react';

export default function CustomizationBox({
  flex = 1,
  onClick,
  imageUrl,
  selected,
  children,
  disabled = false,
  imgProps,
}: {
  disabled?: boolean;
  imageUrl?: string;
  selected?: boolean;
  flex?: React.CSSProperties['flex'];
  onClick?: () => void;
  children?: React.ReactNode;
  imgProps?: SxProps;
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
        flex,
        overflow: 'hidden',
        ...imgProps,
      }}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'scale-down',
          }}
        />
      ) : (
        children
      )}
    </Sheet>
  );
}
