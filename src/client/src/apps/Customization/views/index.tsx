import { Divider, useTheme } from '@mui/joy';
import { Sheet } from '@mui/joy';
import CustomizationTop from '../components/CustomizationTop';
import CustomizationBottom from '../components/CustomizationBottom';
import {
  InventoryCategory,
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from '../state';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import React from 'react';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';

export default function CustomizationPanel() {
  const [penguinBelly, setPenguinBelly] = React.useState<Pixi.Sprite | null>(
    null
  );
  const [penguinClothes, setPenguinClothes] = React.useState<
    Record<InventoryCategory, Pixi.Sprite>
  >({} as Record<InventoryCategory, Pixi.Sprite>);

  const loadClothes = useRecoilCallback(
    (ctx) => async () => {
      const inventory = await ctx.snapshot.getPromise(inventoryAtom);
      const { color, ...selected } = inventory.selected;
      const clothingAssets = (
        Object.keys(selected) as (keyof typeof selected)[]
      )
        .map((clothPiece) => {
          const clothId = inventory.selected[clothPiece as InventoryCategory];
          const sprite = Pixi.Sprite.from(
            clothId === -1
              ? Pixi.Texture.EMPTY
              : `/penguin/clothing/${clothId}/paper.webp`
          );
          sprite.name = clothPiece;
          sprite.anchor.set(0.5);
          sprite.position.set(0, 0);
          sprite.scale.set(0.72);
          return sprite;
        })
        .reduce(
          (acc, sprite) => ({ ...acc, [String(sprite.name)]: sprite }),
          {}
        ) as Record<InventoryCategory, Pixi.Sprite>;
      setPenguinClothes(clothingAssets);
      return clothingAssets;
    },
    []
  );

  const updatePenguinColor = useRecoilCallback(
    (ctx) => (piece: InventoryCategory, id: number) => {
      if (!penguinBelly) return;
      penguinBelly.tint =
        penguinColorPalette[id.toString() as keyof typeof penguinColorPalette];
      ctx.set(inventoryAtom, (prev) => ({
        ...prev,
        selected: { ...prev.selected, [piece]: id },
      }));
    },
    [penguinBelly]
  );
  const updateCloth = useRecoilCallback(
    (ctx) => (piece: InventoryCategory, id: number) => {
      if (piece === 'color') return updatePenguinColor(piece, id);
      if (id === -1) {
        penguinClothes[piece].texture = Pixi.Texture.EMPTY;
      } else
        penguinClothes[piece].texture = Pixi.Texture.from(
          `/penguin/clothing/${id}/paper.webp`
        );
      ctx.set(inventoryAtom, (prev) => ({
        ...prev,
        selected: { ...prev.selected, [piece]: id },
      }));
    },
    [penguinClothes, updatePenguinColor]
  );

  return (
    <Sheet
      sx={{
        width: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <CustomizationTop
        setPenguinBelly={setPenguinBelly}
        loadClothes={loadClothes}
        setPenguinClothes={setPenguinClothes}
        updateCloth={updateCloth}
      />
      <Divider orientation="horizontal" />
      <CustomizationBottom updateCloth={updateCloth} />
    </Sheet>
  );
}
