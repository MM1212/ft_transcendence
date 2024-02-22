import { useInventoryByType } from '@apps/Inventory/hooks/useInventory';
import MenuLeftOutlineIcon from '@components/icons/MenuLeftOutlineIcon';
import MenuRightOutlineIcon from '@components/icons/MenuRightOutlineIcon';
import { Box, Tooltip } from '@mui/joy';
import { IconButton } from '@mui/joy';
import React from 'react';
import { ballsConfig, paddleConfig, specialPConfig } from './ItemConfigs';
import { Stack } from '@mui/joy';

export function ArrowSelector({
  selectType,
  onClick,
  selected,
  disabled = false,
}: {
  selectType: 'ball' | 'paddle' | 'special_power';
  onClick?: (tex: string) => void;
  selected?: string;
  disabled?: boolean;
}) {
  const items = useInventoryByType(`pong-${selectType}`);

  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  const [keys, setKeys] = React.useState<string[]>([]);

  const config =
    selectType === 'ball'
      ? ballsConfig
      : selectType === 'paddle'
        ? paddleConfig
        : specialPConfig;

  React.useEffect(() => {
    setKeys(items.map((item) => item.name));
  }, [items]);

  React.useEffect(() => {
    const idx = !selected ? 0 : keys.findIndex((itemId) => itemId === selected);
    setCurrentIndex(idx);
    onClick && onClick(keys[idx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, selected]);
  const onNext = React.useCallback(() => {
    const newIndex = (currentIndex + 1) % keys.length;
    setCurrentIndex(newIndex);
    onClick && onClick(keys[newIndex]);
  }, [keys, currentIndex, onClick]);

  const onPrev = React.useCallback(() => {
    const newIndex = (currentIndex - 1 + keys.length) % keys.length;
    setCurrentIndex(newIndex);
    onClick && onClick(keys[newIndex]);
  }, [keys, currentIndex, onClick]);

  if (keys.length === 0) return null;
  if (keys.length === 1) disabled = true;
  if (!config.has(keys[currentIndex])) return null;
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={onPrev} size="sm" disabled={disabled}>
          <MenuLeftOutlineIcon />
        </IconButton>
        <Tooltip title={keys[currentIndex]} placement="top">
          <Box
            sx={{
              width: '4dvh',
              aspectRatio: '1/1',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src={config.get(keys[currentIndex])!}
              alt={keys[currentIndex]}
              style={{
                ...(selectType === 'paddle' && {
                  transform: 'rotate(90deg)',
                }),
                width: '100%',
                height: '100%',
                objectFit: 'scale-down',
              }}
            />
          </Box>
        </Tooltip>
        <IconButton onClick={onNext} size="sm" disabled={disabled}>
          <MenuRightOutlineIcon />
        </IconButton>
      </Stack>
    </>
  );
}
