import { Box, Divider, useTheme } from "@mui/joy";
import { Stack } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";
import { Pixi, usePixiRenderer } from "@hooks/pixiRenderer";
import React from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import {
  InventoryCategory,
  getClothIcon,
  inventoryAtom,
  penguinClothingPriority,
  penguinColorPalette,
} from "../state";

const inventCatLeft: InventoryCategory[] = ["head", "body", "feet"];

const inventCatRight: InventoryCategory[] = ["face", "neck", "hand"];

interface ICustTop {
  setPenguinBelly: React.Dispatch<React.SetStateAction<Pixi.Sprite | null>>;
  loadClothes: () => Record<InventoryCategory, Pixi.Sprite>;
  setPenguinClothes: React.Dispatch<
    React.SetStateAction<Record<InventoryCategory, Pixi.Sprite>>
  >;
}

export default function CustomizationTop({
  setPenguinBelly,
  loadClothes,
  setPenguinClothes
}: ICustTop) {
  const inventory = useRecoilValue(inventoryAtom);

  const paperRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

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
    setPenguinBelly(paperBelly);
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
          penguinClothingPriority[String(a.name) as InventoryCategory] -
          penguinClothingPriority[String(b.name) as InventoryCategory]
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
      setPenguinClothes({} as Record<InventoryCategory, Pixi.Sprite>);
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
