import { Divider } from '@mui/joy';
import { Sheet } from '@mui/joy';
import CustomizationTop from '../components/CustomizationTop';
import CustomizationBottom from '../components/CustomizationBottom';
import {
  InventoryCategory,
  backClothingItemsAtom,
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from '../state';
import { useRecoilCallback } from 'recoil';
import React from 'react';
import { Pixi } from '@hooks/pixiRenderer';
import publicPath from '@utils/public';

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
      const backClothing = await ctx.snapshot.getPromise(backClothingItemsAtom);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { color, ...selected } = inventory.selected;
      const clothingAssets = (
        Object.keys(selected) as (keyof typeof selected)[]
      )
        .map((clothPiece) => {
          const clothId = inventory.selected[clothPiece as InventoryCategory];
          const backItem = backClothing.includes(clothId);
          const sprite = Pixi.Sprite.from(
            clothId === -1
              ? Pixi.Texture.EMPTY
              : publicPath(`/penguin/clothing/${clothId}/paper.webp`)
          );
          sprite.zIndex = backItem ? -1 : penguinClothingPriority[clothPiece];
          sprite.name = clothPiece;
          sprite.anchor.set(0.5);
          sprite.position.set(0, 0);
          sprite.scale.set(backItem ? 0.92 :0.73);
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
    (ctx) => async (piece: InventoryCategory, id: number) => {
      if (piece === 'color') return updatePenguinColor(piece, id);
      const backItems = await ctx.snapshot.getPromise(backClothingItemsAtom);
      if (id === -1) {
        penguinClothes[piece].texture = Pixi.Texture.EMPTY;
      } else
        penguinClothes[piece].texture = Pixi.Texture.from(
          publicPath(`/penguin/clothing/${id}/paper.webp`)
        );
      penguinClothes[piece].zIndex = backItems.includes(id)
        ? -1
        : penguinClothingPriority[piece];
      penguinClothes[piece].scale.set(backItems.includes(id) ? 0.92 : 0.73);
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
        borderLeft: '1px solid',
        borderColor: 'divider',
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
