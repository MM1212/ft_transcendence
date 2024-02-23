import { Box, CircularProgress, Divider, useTheme } from '@mui/joy';
import { Stack } from '@mui/joy';
import { Sheet } from '@mui/joy';
import CustomizationBox from './CustomizationBox';
import { Pixi, usePixiRenderer } from '@hooks/pixiRenderer';
import React, { memo } from 'react';
import { InventoryCategory, getClothIcon } from '../state';
import publicPath from '@utils/public';
import { lobbyAtom, useLobbyPenguinClothes } from '@apps/Lobby/state';
import TshirtVIcon from '@components/icons/TshirtVIcon';
import { useRecoilCallback } from 'recoil';
import { ClientCharacter } from '@apps/Lobby/src/Character';

const inventCatLeft: InventoryCategory[] = ['head', 'body', 'feet'];

const inventCatRight: InventoryCategory[] = ['face', 'neck', 'hand'];

interface ICustTop {
  setPenguinBelly: React.Dispatch<React.SetStateAction<Pixi.Sprite | null>>;
  loadClothes: () => Promise<Record<InventoryCategory, Pixi.Sprite>>;
  updateCloth: (piece: InventoryCategory, id: number) => Promise<void>;
  isLobbyLoading: boolean;
}

function _CustomizationRender({
  setPenguinBelly,
  loadClothes,
  isLobbyLoading,
}: Omit<ICustTop, 'updateCloth'>): JSX.Element {
  const paperRef = React.useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const onAppMount = useRecoilCallback(
    (ctx) => async (app: Pixi.Application) => {
      const lobby = await ctx.snapshot.getPromise(lobbyAtom);
      if (!lobby || !lobby.mainPlayer || isLobbyLoading) {
        app.destroy(true, {
          children: true,
        });
        return;
      }

      await Pixi.Assets.load(publicPath('/penguin/paper/asset.json'));
      const paperContainer = new Pixi.Container();
      const paperBelly = new Pixi.Sprite(
        Pixi.Texture.from('penguin/paperdoll/body')
      );
      paperBelly.anchor.set(0.5);
      paperBelly.position.set(0, 0);
      paperBelly.tint =
        ClientCharacter.colorPalette[
          lobby.mainPlayer.character.tint.toString() as any
        ];
      setPenguinBelly(paperBelly);
      const paperFixtures = new Pixi.Sprite(
        Pixi.Texture.from('penguin/paperdoll/fixtures')
      );
      paperFixtures.anchor.set(0.5);
      paperFixtures.position.set(0, 0);

      const clothes = await loadClothes();
      paperContainer.sortableChildren = true;
      paperContainer.addChild(
        paperBelly,
        paperFixtures,
        ...Object.values<Pixi.Sprite>(clothes)
      );
      paperContainer.sortChildren();
      paperContainer.position.set(app.screen.width / 2, app.screen.height / 2);
      app.stage.addChild(paperContainer);
    },
    [loadClothes, setPenguinBelly, isLobbyLoading]
  );

  const bgColor = theme.resolveVar('palette-background-surface');
  usePixiRenderer(
    paperRef,
    onAppMount,
    React.useMemo(
      () => ({
        backgroundColor: '0xFF00BB',
      }),
      [bgColor]
    )
  );

  return React.useMemo(
    () => (
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={paperRef}
      >
        {isLobbyLoading && (
          <CircularProgress
            variant="plain"
            style={{
              position: 'absolute',
              zIndex: 1,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </Box>
    ),
    [isLobbyLoading]
  );
}

const CustomizationRender = memo(_CustomizationRender);

export default function CustomizationTop({
  setPenguinBelly,
  loadClothes,
  updateCloth,
  isLobbyLoading,
}: ICustTop) {
  const clothes = useLobbyPenguinClothes();

  return (
    <Sheet sx={{ width: '100%', display: 'flex', height: '70%' }}>
      <Stack
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          width: '25%',
        }}
        p={5}
        spacing={5}
      >
        {inventCatLeft.map((inventCat) => {
          return (
            <CustomizationBox
              key={inventCat}
              imageUrl={
                clothes[inventCat] === -1
                  ? undefined
                  : getClothIcon(clothes[inventCat])
              }
              onClick={() => updateCloth(inventCat, -1)}
              loading={isLobbyLoading}
              disabled={clothes[inventCat] === -1}
            >
              <TshirtVIcon />
            </CustomizationBox>
          );
        })}
      </Stack>
      <Divider orientation="vertical" />
      <CustomizationRender
        setPenguinBelly={setPenguinBelly}
        loadClothes={loadClothes}
        isLobbyLoading={isLobbyLoading}
      />
      <Divider orientation="vertical" />
      <Stack
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          width: '25%',
        }}
        p={5}
        spacing={5}
      >
        {inventCatRight.map((inventCat) => {
          return (
            <CustomizationBox
              key={inventCat}
              imageUrl={
                clothes[inventCat] === -1
                  ? undefined
                  : getClothIcon(clothes[inventCat])
              }
              onClick={() => updateCloth(inventCat, -1)}
              disabled={clothes[inventCat] === -1}
              loading={isLobbyLoading}
            >
              <TshirtVIcon />
            </CustomizationBox>
          );
        })}
      </Stack>
    </Sheet>
  );
}
