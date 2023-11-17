import { Box, Divider, useTheme } from "@mui/joy";
import { Stack } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";
import { Pixi, usePixiRenderer } from "@hooks/pixiRenderer";
import React from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import {
  InventoryCategories,
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from "../state";

export const getClothIcon = (clothId: number) =>
  `/penguin/clothing/${clothId}/icon.webp`;

const inventCatLeft: InventoryCategories[] = ["head", "body", "feet"];

const inventCatRight: InventoryCategories[] = ["face", "neck", "hand"];

export default function CustomizationTop() {
  const inventory = useRecoilValue(inventoryAtom);
  const [penguinBelly, setPenguinBelly] = React.useState<Pixi.Sprite | null>(
    null
  );
  const [penguinClothes, setPenguinClothes] = React.useState<
    Record<InventoryCategories, Pixi.Sprite>
  >({} as Record<InventoryCategories, Pixi.Sprite>);

  const paperRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const loadClothes = React.useCallback(() => {
    const clothingAssets = (
      Object.keys(inventory.selected)
        .map((clothPiece) => {
          if (clothPiece === "color") return null;
          const clothId = inventory.selected[clothPiece as InventoryCategories];
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
    ) as Record<InventoryCategories, Pixi.Sprite>;
    setPenguinClothes(clothingAssets);
    return clothingAssets;
  }, []);

  const updateCloth = useRecoilCallback(
    (ctx) => (piece: InventoryCategories, id: number) => {
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
    (ctx) => (piece: InventoryCategories, id: number) => {
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

  const onAppMount = React.useCallback(async (app: Pixi.Application) => {
    await Pixi.Assets.load("/penguin/paper/asset.json");
    const paperContainer = new Pixi.Container();
    const paperBelly = new Pixi.Sprite(
      Pixi.Texture.from("penguin/paperdoll/body")
    );
    paperBelly.anchor.set(0.5);
    paperBelly.position.set(0, 0);
    paperBelly.tint =
      penguinColorPalette[
        inventory.selected.color.toString() as keyof typeof penguinColorPalette
      ];
    //setPenguinBelly(paperBelly);
    const paperFixtures = new Pixi.Sprite(
      Pixi.Texture.from("penguin/paperdoll/fixtures")
    );
    paperFixtures.anchor.set(0.5);
    paperFixtures.position.set(0, 0);

    const clothes = loadClothes();
    paperContainer.addChild(
      paperBelly,
      paperFixtures,
      ...Object.values<Pixi.Sprite>(clothes).sort((a, b) => {
        return (
          penguinClothingPriority[String(a.name) as InventoryCategories] -
          penguinClothingPriority[String(b.name) as InventoryCategories]
        );
      })
    );
    paperContainer.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(paperContainer);
    return () => {
      paperContainer.destroy();
      paperBelly.destroy();
      paperFixtures.destroy();
      Object.values(clothes).forEach((cloth) => cloth.destroy());
      setPenguinClothes({} as Record<InventoryCategories, Pixi.Sprite>);
      //setPenguinBelly(null);
      app.stage.removeChildren();
      (app.view as HTMLCanvasElement).remove();
    };
  }, []);

  usePixiRenderer(
    paperRef,
    onAppMount,
    React.useMemo(
      () => ({
        backgroundColor: theme.resolveVar("palette-background-surface"),
      }),
      []
    )
  );
  return (
    <Sheet sx={{ width: "100%", display: "flex", height: "70%" }}>
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        {inventCatLeft.map((inventCat) => {
          return (
            <CustomizationBox
              key={inventory.selected[inventCat]}
              clicable={false}
              imageUrl={getClothIcon(inventory.selected[inventCat])}
            />
          );
        })}
      </Stack>
      <Divider orientation="vertical" />
      <Box
        sx={{
          width: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        ref={paperRef}
      ></Box>
      <Divider orientation="vertical" />
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        {inventCatRight.map((inventCat) => {
          return (
            <CustomizationBox
              key={inventory.selected[inventCat]}
              clicable={false}
              imageUrl={getClothIcon(inventory.selected[inventCat])}
            />
          );
        })}
      </Stack>
    </Sheet>
  );
}
