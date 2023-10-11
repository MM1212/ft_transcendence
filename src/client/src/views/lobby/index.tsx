import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import { Endpoints } from "@typings/api";
import React from "react";
import { Pixi, usePixiRenderer } from "@hooks/pixiRenderer";
import { Lobbies } from "@typings/lobby";
import { useRecoilCallback, useRecoilValue } from "recoil";
import {
  InitdPlayer,
  Player,
  drawerOpenAtom,
  lobbyAppAtom,
  lobbyCurrentPlayerSelector,
  lobbyPlayersAtom,
} from "./state";
import { useKeybindsToggle } from "@hooks/keybinds";
import DrawerCloseButton from "./menuOptions";
import ChatBox from "./chat";

const rendererOptions: Partial<Pixi.IApplicationOptions> = {};

const mainTex = Pixi.Texture.from("https://pixijs.com/assets/bunny.png");
const backgroundTex = Pixi.Texture.from(
  buildTunnelEndpoint(Endpoints.LobbyBackground)
);
const initSprite = (app: Pixi.Application, player: InitdPlayer) => {
  player.sprite.x = player.transform.position.x;
  player.sprite.y = player.transform.position.y;
  player.sprite.name = `lobby/${player.user.id}-${player.user.nickname}`;
  player.nickNameText.x = 10;
  player.nickNameText.y = -20;
  player.nickNameText.anchor.set(0.5);
  player.sprite.addChild(player.nickNameText);
  app.stage.addChild(player.sprite);
  // Set the name property to identify the text later if needed
};

export default function Lobby() {
  const { useMounter, emit, useListener } = useSocket(
    buildTunnelEndpoint(Endpoints.LobbySocket)
  );
  const loadData = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      if (!app)
        return ctx.set(
          lobbyPlayersAtom,
          data.players.map((player) => ({ ...player, sprite: null, nickNameText: null }))
        );
      const players = data.players.map<InitdPlayer>((player) => ({
        ...player,
        sprite: new Pixi.Sprite(mainTex),
        nickNameText: new Pixi.Text(player.user.nickname, {
          fontFamily: "Inter",
					dropShadow: true,
					dropShadowDistance: 2,
					dropShadowAngle: 1,
					dropShadowAlpha: 1,
					dropShadowColor: '#000',
					stroke: '#000',
					strokeThickness: 1,
          fontSize: 12,
          align: "center",
          fill: "#fef08a",
        }),
      }));
      players.forEach((player) => initSprite(app, player));
      ctx.set(lobbyPlayersAtom, players);
    },
    []
  );

  const newPlayer = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.NewPlayer) => {
      const { player }: { player: Player } = data as { player: Player };
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      console.log("BOAS", player, app);
      if (!app)
        return ctx.set(lobbyPlayersAtom, (prev) => [
          ...prev,
          { ...player, sprite: null },
        ]);
      player.sprite = new Pixi.Sprite(mainTex);
      player.nickNameText = new Pixi.Text(player.user.nickname, {
        fontFamily: "Inter",
				dropShadow: true,
        fontSize: 16,
        align: "center",
        fill: "#fef08a",
        fontWeight: "bold",
      });
      initSprite(app, player as InitdPlayer);
      ctx.set(lobbyPlayersAtom, (prev) => [...prev, player]);
    },
    []
  );

  const setPlayers = useRecoilCallback(
    (ctx) => async (data: Lobbies.Packets.LoadData) => {
      const app = await ctx.snapshot.getPromise(lobbyAppAtom);
      ctx.set(lobbyPlayersAtom, (prev) =>
        prev
          .map((player) => {
            const newData = data.players.find(
              (p) => p.user.id === player.user.id
            );
            if (!newData) return player;
            return { ...player, ...newData };
          })
          .map((player) => {
            if (!app || !player.sprite) return player;
            player.sprite.x = player.transform.position.x;
            player.sprite.y = player.transform.position.y;
            return player;
          })
      );
    },
    []
  );

  const removePlayer = useRecoilCallback(
    (ctx) =>
      async ({ id }: Lobbies.Packets.RemovePlayer) => {
        const app = await ctx.snapshot.getPromise(lobbyAppAtom);
        ctx.set(lobbyPlayersAtom, (prev) =>
          prev.filter((p) => {
            if (p.user.id !== id) return true;
            if (!app || !p.sprite) return false;
            app.stage.removeChild(p.sprite);
            return false;
          })
        );
      },
    []
  );

  const updatePlayersTransform = useRecoilCallback(
    (ctx) =>
      async ({ players }: Lobbies.Packets.UpdatePlayersTransform) => {
        const app = await ctx.snapshot.getPromise(lobbyAppAtom);
        ctx.set(lobbyPlayersAtom, (prev) =>
				prev.map((player) => {
					const data = players.find((p) => player.user.id === p.id);
					if (!data) return player;
            if (data.position) player.transform.position = data.position;
            if (data.velocity) player.transform.velocity = data.velocity;
            if (!app || !player.sprite) return player;
            player.sprite.x = player.transform.position.x;
            player.sprite.y = player.transform.position.y;
            return player;
          })
        );
      },
    []
  );

  useListener(Lobbies.Packets.Events.LoadData, loadData);
  useListener(Lobbies.Packets.Events.NewPlayer, newPlayer);
  useListener(Lobbies.Packets.Events.SetPlayers, setPlayers);
  useListener(Lobbies.Packets.Events.RemovePlayer, removePlayer);
  useListener(
    Lobbies.Packets.Events.UpdatePlayersTransform,
    updatePlayersTransform
  );

  useMounter();

  useListener("connect", () => console.log("connected"));
  useListener("disconnect", () => console.log("disconnected"));

  const ref = React.useRef<HTMLDivElement>(null);

  const onAppMount = useRecoilCallback(
    (ctx) => async (app: Pixi.Application) => {
      const background = new Pixi.Sprite(backgroundTex);
      background.width = app.view.width;
      background.height = app.view.height;
      app.stage.addChild(background);
      ctx.set(lobbyAppAtom, app);
      const players = await ctx.snapshot.getPromise(lobbyPlayersAtom);
      for (const player of players) {
        if (player.sprite) continue;
        player.sprite = new Pixi.Sprite(mainTex);
        player.nickNameText = new Pixi.Text(player.user.nickname, {
          fontFamily: "Inter",
					dropShadow: true,
					dropShadowDistance: 2,
					dropShadowAngle: 1,
					dropShadowAlpha: 1,
					dropShadowColor: '#000',
          fontSize: 12,
          align: "center",
          fill: "#fef08a",
        });
        initSprite(app, player as InitdPlayer);
      }
      app.ticker.maxFPS = 60;
      app.ticker.minFPS = 60;
      return () => void 0;
    },
    []
  );
  usePixiRenderer(ref, onAppMount, rendererOptions);
  const players = useRecoilValue(lobbyPlayersAtom);
  const app = useRecoilValue(lobbyAppAtom);
  React.useEffect(() => {
    if (!app) return;
    const tick = async (delta: number) => {
      for (const player of players) {
        if (!player.sprite) continue;
        player.transform.position.x += player.transform.velocity.x * delta;
        player.transform.position.y += player.transform.velocity.y * delta;

        player.sprite.x = player.transform.position.x;
        player.sprite.y = player.transform.position.y;
      }
    };
    app.ticker.add(tick);
    return () => {
      app.ticker.remove(tick);
    };
  }, [players, app]);

  const onBindToggle = useRecoilCallback(
    (ctx) => async (key, pressed) => {

      console.log("update-velocity", { key, pressed });

			const checkDrawerStatus = ctx.snapshot.getLoadable(drawerOpenAtom).contents;

			console.log('Drawer open status:', checkDrawerStatus);
      const player = await ctx.snapshot.getPromise(lobbyCurrentPlayerSelector);

			if (!player || !player.sprite) return;
			if (checkDrawerStatus) return;
      emit("update-velocity", { key, pressed });
      switch (key) {
        case "KeyA":
          player.transform.velocity.x = pressed ? -1 : 0;
          break;
        case "KeyD":
          player.transform.velocity.x = pressed ? 1 : 0;
          break;
        case "KeyW":
          player.transform.velocity.y = pressed ? -1 : 0;
          break;
        case "KeyS":
          player.transform.velocity.y = pressed ? 1 : 0;
          break;
      }
      player.sprite.x = player.transform.position.x;
      player.sprite.y = player.transform.position.y;
    },
    [emit]
  );
  useKeybindsToggle(["KeyW", "KeyA", "KeyS", "KeyD"], onBindToggle, []);

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
        }}
        ref={ref}
      />
      <DrawerCloseButton />
	  <><ChatBox></ChatBox></>
    </>
  );
}
