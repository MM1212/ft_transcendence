import { Box, Divider, useTheme } from '@mui/joy';
import { Stack } from '@mui/joy';
import { Sheet } from '@mui/joy';
import CustomizationBox from './CustomizationBox';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';
import React from 'react';

export const getClothIcon = (clothId: number) =>
  `/penguin/clothing/${clothId}/icon.webp`;

export default function CustomizationTop() {
  const mySetupLeft: string[] = [
    getClothIcon(195),
    getClothIcon(258),
    getClothIcon(231),
  ];
  const mySetupRight: string[] = [
    getClothIcon(374),
    getClothIcon(490),
    getClothIcon(1950),
  ];

  const paperRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const onAppMount = React.useCallback(async (app: Pixi.Application) => {
    await Pixi.Assets.load('/penguin/paper/asset.json');
    const paperContainer = new Pixi.Container();
    const paperBelly = new Pixi.Sprite(
      Pixi.Texture.from('penguin/paperdoll/body')
    );
    paperBelly.anchor.set(0.5);
    paperBelly.position.set(0, 0);
    paperBelly.tint = 0xffafff;
    const paperFixtures = new Pixi.Sprite(
      Pixi.Texture.from('penguin/paperdoll/fixtures')
    );
    paperFixtures.anchor.set(0.5);
    paperFixtures.position.set(0, 0);
    const clothingAssets = [490, 231, 374, 258, 195].map(clothId => {
      const sprite = Pixi.Sprite.from(`/penguin/clothing/${clothId}/paper.webp`);
      sprite.anchor.set(0.5);
      sprite.position.set(0, 0);
      sprite.scale.set(0.72);
      return sprite;
    });
    
    paperContainer.addChild(
      paperBelly,
      paperFixtures,
      ...clothingAssets
    );
    paperContainer.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(paperContainer);
    return () => {
      paperContainer.destroy();
      paperBelly.destroy();
      paperFixtures.destroy();
      clothingAssets.forEach(clothing => clothing.destroy());
      app.stage.removeChildren();
      (app.view as HTMLCanvasElement).remove();
      app.destroy();
    };
  }, []);

  usePixiRenderer(paperRef, onAppMount, {
    backgroundColor: theme.resolveVar('palette-background-surface'),
  });
  return (
    <Sheet sx={{ width: '100%', display: 'flex', height: '70%' }}>
      <Stack
        sx={{ display: 'flex', justifyContent: 'space-evenly', width: '25%' }}
      >
        {mySetupRight.map((image, index) => (
          <CustomizationBox key={index} clicable={false} imageUrl={image} />
        ))}
      </Stack>
      <Divider orientation="vertical" />
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={paperRef}
      ></Box>
      <Divider orientation="vertical" />
      <Stack
        sx={{ display: 'flex', justifyContent: 'space-evenly', width: '25%' }}
      >
        {mySetupLeft.map((image, index) => (
          <CustomizationBox key={index} clicable={false} imageUrl={image} />
        ))}
      </Stack>
    </Sheet>
  );
}
