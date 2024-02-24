import { Divider } from '@mui/joy';
import { Sheet } from '@mui/joy';
import CustomizationTop from '../components/CustomizationTop';
import CustomizationBottom from '../components/CustomizationBottom';
import { InventoryCategory, backClothingItemsAtom } from '../state';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import React from 'react';
import { Pixi } from '@hooks/pixiRenderer';
import publicPath from '@utils/public';
import { lobbyAtom } from '@apps/Lobby/state';
import { INetPlayerClothesEvent } from '@apps/Lobby/src/Network';
import LobbyModel from '@typings/models/lobby';
import { useIsLobbyLoading } from '@apps/Lobby/hooks';
import { ClientCharacter } from '@apps/Lobby/src/Character';

const SCALING_BACK = 0.92;
const SCALING_NORMAL: Record<LobbyModel.Models.InventoryCategory, number> = {
  head: .96,
  face: 0.91,
  neck: 1,
  body: 0.98,
  hand: 1,
  feet: 1,
  color: -1,
}

export default function CustomizationPanel() {
  const [penguinBelly, setPenguinBelly] = React.useState<Pixi.Sprite | null>(
    null
  );
  const penguinClothes = React.useRef<Record<
    InventoryCategory,
    Pixi.Sprite
  > | null>(null);

  const loadClothes = useRecoilCallback(
    (ctx) => async () => {
      const lobby = await ctx.snapshot.getPromise(lobbyAtom);
      if (!lobby || !lobby.mainPlayer)
        return {
          head: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          face: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          neck: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          body: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          hand: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          feet: Pixi.Sprite.from(Pixi.Texture.EMPTY),
          color: Pixi.Sprite.from(Pixi.Texture.EMPTY),
        };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { color, ...selected } = lobby.mainPlayer.character.clothes;
      const backClothing = await ctx.snapshot.getPromise(backClothingItemsAtom);
      // const { color, ...selected } = inventory.selected;
      const clothingAssets = (
        Object.keys(selected) as (keyof typeof selected)[]
      )
        .map((clothPiece) => {
          const clothId = selected[clothPiece];
          const backItem = backClothing.includes(clothId);
          const sprite = Pixi.Sprite.from(
            clothId === -1
              ? Pixi.Texture.EMPTY
              : publicPath(`/penguin/clothing/${clothId}/paper.webp`)
          );
          sprite.zIndex = backItem
            ? -1
            : ClientCharacter.clothingPriority[clothPiece];
          sprite.name = clothPiece;
          sprite.anchor.set(0.5);
          sprite.position.set(0, 0);
          sprite.scale.set(backItem ? SCALING_BACK : SCALING_NORMAL[clothPiece]);
          return sprite;
        })
        .reduce(
          (acc, sprite) => ({ ...acc, [String(sprite.name)]: sprite }),
          {}
        ) as Record<InventoryCategory, Pixi.Sprite>;
      penguinClothes.current = clothingAssets;
      return clothingAssets;
    },
    []
  );

  const updatePenguinColor = useRecoilCallback(
    (ctx) => async (id: number) => {
      if (!penguinBelly) return;
      const lobby = await ctx.snapshot.getPromise(lobbyAtom);
      if (!lobby || !lobby.mainPlayer) return;
      await lobby.mainPlayer.character.dress('color', id);
      penguinBelly.tint = ClientCharacter.colorPalette[id.toString() as any];
    },
    [penguinBelly]
  );
  const updateCloth = useRecoilCallback(
    (ctx) => async (piece: InventoryCategory, id: number) => {
      if (piece === 'color') return await updatePenguinColor(id);
      const lobby = await ctx.snapshot.getPromise(lobbyAtom);
      if (
        !penguinClothes.current ||
        !lobby ||
        !lobby.mainPlayer ||
        lobby.loading
      )
        return;
      const character = lobby.mainPlayer.character;
      const backItems = await ctx.snapshot.getPromise(backClothingItemsAtom);
      if (id === -1) {
        penguinClothes.current[piece].texture = Pixi.Texture.EMPTY;
        await character.undress(piece);
      } else {
        penguinClothes.current[piece].texture = Pixi.Texture.from(
          publicPath(`/penguin/clothing/${id}/paper.webp`)
        );
        await character.dress(piece, id);
      }
      penguinClothes.current[piece].zIndex = backItems.includes(id)
        ? -1
        : ClientCharacter.clothingPriority[piece];
      penguinClothes.current[piece].scale.set(
        backItems.includes(id) ? SCALING_BACK : SCALING_NORMAL[piece]
      );
    },
    [penguinClothes, updatePenguinColor]
  );

  const lobby = useRecoilValue(lobbyAtom);

  const onNetClothesChange = useRecoilCallback(
    (ctx) =>
      async (changed: Record<LobbyModel.Models.InventoryCategory, number>) => {
        if (
          !lobby ||
          !lobby.mainPlayer ||
          lobby.loading ||
          !penguinClothes.current
        )
          return;
        for await (const [piece, id] of Object.entries(changed) as [
          LobbyModel.Models.InventoryCategory,
          number,
        ][]) {
          if (piece === 'color') {
            if (!penguinBelly) continue;
            penguinBelly.tint =
              ClientCharacter.colorPalette[id.toString() as any];
            continue;
          }
          const backItems = await ctx.snapshot.getPromise(
            backClothingItemsAtom
          );
          if (id === -1) {
            penguinClothes.current[piece].texture = Pixi.Texture.EMPTY;
          } else {
            penguinClothes.current[piece].texture = Pixi.Texture.from(
              publicPath(`/penguin/clothing/${id}/paper.webp`)
            );
          }
          penguinClothes.current[piece].zIndex = backItems.includes(id)
            ? -1
            : ClientCharacter.clothingPriority[piece];
          penguinClothes.current[piece].scale.set(
            backItems.includes(id) ? SCALING_BACK : SCALING_NORMAL[piece]
          );
        }
      },
    [lobby, penguinBelly]
  );
  React.useEffect(() => {
    lobby?.events.on<INetPlayerClothesEvent>(
      'self:net:clothes:update',
      onNetClothesChange
    );
    return () => {
      lobby?.events.off<INetPlayerClothesEvent>(
        'self:net:clothes:update',
        onNetClothesChange
      );
    };
  }, [lobby, onNetClothesChange]);

  const isLobbyLoading = useIsLobbyLoading();

  return React.useMemo(
    () => (
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
          updateCloth={updateCloth}
          isLobbyLoading={isLobbyLoading}
        />
        <Divider orientation="horizontal" />
        <CustomizationBottom
          updateCloth={updateCloth}
          isLobbyLoading={isLobbyLoading}
        />
      </Sheet>
    ),
    [loadClothes, updateCloth, isLobbyLoading]
  );
}
