import { useInventoryByType } from '@apps/Inventory/hooks/useInventory';
import MenuLeftOutlineIcon from '@components/icons/MenuLeftOutlineIcon';
import MenuRightOutlineIcon from '@components/icons/MenuRightOutlineIcon';
import { Tooltip } from '@mui/joy';
import { IconButton } from '@mui/joy';
import React from 'react';
import { ballsConfig, paddleConfig, specialPConfig } from './ItemConfigs';
import { Stack } from '@mui/joy';

export function ArrowSelector({
  selectType,
  onClick,
  indexElem,
}: {
  selectType: 'ball' | 'paddle' | 'special_power';
  onClick?: (tex: string) => void;
  indexElem?: number;
}) {
  const items = useInventoryByType(`pong-${selectType}`);

  const [currentIndex, setCurrentIndex] = React.useState<number>(indexElem || 0);
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
  //if (!config.has(keys[currentIndex])) return null;
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton onClick={onPrev}>
          <MenuLeftOutlineIcon />
        </IconButton>
        <Tooltip title={keys[currentIndex]} placement="top">
          <img src={config.get(keys[currentIndex])!} alt={keys[currentIndex]} />
        </Tooltip>
        <IconButton onClick={onNext}>
          <MenuRightOutlineIcon />
        </IconButton>
      </Stack>
    </>
  );
}
