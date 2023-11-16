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
    const clothingItem1 = Pixi.Sprite.from('/penguin/clothing/490/paper.webp');
    clothingItem1.anchor.set(0.5);
    clothingItem1.position.set(0, 0);
    clothingItem1.scale.set(0.72);

    const clothingItem2 = Pixi.Sprite.from('/penguin/clothing/231/paper.webp');
    clothingItem2.anchor.set(0.5);
    clothingItem2.position.set(0, 0);
    clothingItem2.scale.set(0.72);

    const clothingItem3 = Pixi.Sprite.from('/penguin/clothing/374/paper.webp');
    clothingItem3.anchor.set(0.5);
    clothingItem3.position.set(0, 0);
    clothingItem3.scale.set(0.72);

    const clothingItem4 = Pixi.Sprite.from('/penguin/clothing/258/paper.webp');
    clothingItem4.anchor.set(0.5);
    clothingItem4.position.set(0, 0);
    clothingItem4.scale.set(0.72);

    const clothingItem5 = Pixi.Sprite.from('/penguin/clothing/195/paper.webp');
    clothingItem5.anchor.set(0.5);
    clothingItem5.position.set(0, 0);
    clothingItem5.scale.set(0.72);

    paperContainer.addChild(
      paperBelly,
      paperFixtures,
      clothingItem1,
      clothingItem3,
      clothingItem4,
      clothingItem2,
      clothingItem5
    );
    paperContainer.position.set(app.screen.width / 2, app.screen.height / 2);
    app.stage.addChild(paperContainer);
    return () => {
      paperContainer.destroy();
      paperBelly.destroy();
      paperFixtures.destroy();
      clothingItem1.destroy();
      clothingItem2.destroy();
      clothingItem3.destroy();
      clothingItem4.destroy();
      clothingItem5.destroy();
      app.stage.removeChildren();
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
