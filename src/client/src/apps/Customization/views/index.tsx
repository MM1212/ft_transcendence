import { Divider, useTheme } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationTop from "../components/CustomizationTop";
import CustomizationBottom from "../components/CustomizationBottom";
import {
  InventoryCategory,
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from "../state";
import { useRecoilCallback, useRecoilValue } from "recoil";
import React from "react";
import { Pixi, usePixiRenderer } from "@hooks/pixiRenderer";

export default function CustomizationPanel() {
  const inventory = useRecoilValue(inventoryAtom);
  const [penguinBelly, setPenguinBelly] = React.useState<Pixi.Sprite | null>(
    null
  );
  const [penguinClothes, setPenguinClothes] = React.useState<
    Record<InventoryCategory, Pixi.Sprite>
  >({} as Record<InventoryCategory, Pixi.Sprite>);

  const loadClothes = React.useCallback(() => {
    const clothingAssets = (
      Object.keys(inventory.selected)
        .map((clothPiece) => {
          if (clothPiece === "color") return null;
          const clothId = inventory.selected[clothPiece as InventoryCategory];
          const sprite = Pixi.Sprite.from(
            `/penguin/clothing/${clothId}/paper.webp`
          );
          sprite.name = clothPiece;
          sprite.anchor.set(0.5);
          sprite.position.set(0, 0);
          sprite.scale.set(0.72);
          return sprite;
        })
        .filter(Boolean) as Pixi.Sprite[]
    ).reduce(
      (acc, sprite) => ({ ...acc, [String(sprite.name)]: sprite }),
      {}
    ) as Record<InventoryCategory, Pixi.Sprite>;
    setPenguinClothes(clothingAssets);
    return clothingAssets;
  }, []);

  const updateCloth = useRecoilCallback(
    (ctx) => (piece: InventoryCategory, id: number) => {
      penguinClothes[piece].texture = Pixi.Texture.from(
        `/penguin/clothing/${id}/paper.webp`
      );
      ctx.set(inventoryAtom, (prev) => ({
        ...prev,
        selected: { ...prev.selected, [piece]: [id] },
      }));
    },
    [setPenguinClothes]
  );

  const updatePenguinColor = useRecoilCallback(
    (ctx) => (piece: InventoryCategory, id: number) => {
      if (!penguinBelly) return;
      penguinBelly.tint =
        penguinColorPalette[id.toString() as keyof typeof penguinColorPalette];
      ctx.set(inventoryAtom, (prev) => ({
        ...prev,
        selected: { ...prev.selected, [piece]: [id] },
      }));
    },
    []
  );

  return (
    <Sheet
      sx={{
        width: "100dvh",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CustomizationTop
        setPenguinBelly={setPenguinBelly}
        loadClothes={loadClothes}
        setPenguinClothes={setPenguinClothes}
      />
      <Divider orientation="horizontal" />
      <CustomizationBottom />
    </Sheet>
  );
}
