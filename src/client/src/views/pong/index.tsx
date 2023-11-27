import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import PongModel from "@typings/models/pong";
// add textures
const Targets = PongModel.Endpoints.Targets;
import { UIGame } from "./Game";
import React from "react";
import {
  ETeamSide,
  IGameConfig,
  IPlayerConfig,
} from "@shared/Pong/config/configInterface";
import { Input } from "@mui/joy";





//export const FireAnim = new Promise<PIXI.Texture[]>((resolve) => {
//  const FireballFolderPath = buildTunnelEndpoint(Targets.FireballAnimDict);
//
//  const FireballAnimation = [...new Array(4)].map((_, i) => ({
//    path: `${FireballFolderPath}/Fireball_${i.toString().padStart(3, "0")}.png`,
//    id: `Fireball_${i.toString().padStart(3, "0")}.png`,
//  }));
//
//  FireballAnimation.forEach((path) =>
//    PIXI.Assets.add({
//      alias: path.id,
//      src: path.path,
//    })
//  );
//  PIXI.Assets.load(FireballAnimation.map((anim) => anim.id)).then(
//    (textures) => {
//      console.log(textures);
//      resolve(Object.values(textures));
//    }
//  );
//}).catch(console.error);


const defaultKeyControls = {
  up: "w",
  down: "s",
  boost: "a",
  shoot: "q",
};

 const defaultPlayerConfig: IPlayerConfig = {
  tag: "",
  teamId: 0,
  type: "player",
  keys: defaultKeyControls,
  specialPower: "Spark",
  paddleTexture: Targets.PaddleTexture1,
  paddleColor: 0xffffff,
  positionOrder: "back",
  userId: "",
  ready: false,
  connected: false,
};

 const defaultLeftTeamConfig = {
  id: ETeamSide.Left,
  players: [],
  score: 0,
};
 const defaultRightTeamConfig = {
  id: ETeamSide.Right,
  players: [],
  score: 0,
};

 const defaultGameConfig: IGameConfig = {
  roomId: "",
  teams: [defaultLeftTeamConfig, defaultRightTeamConfig],
  partyOwnerId: "",
  spectators: [],
  backgroundColor: 0x000000,
  lineColor: 0xffffff,
  nPlayers: 0,
};

export default function Pong() {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(Targets.Connect));

  useMounter();

  // maybe change these to useRef()

  const [game, setGame] = React.useState<UIGame | null>(null);

  const [gameConfig, setGameConfig] =
    React.useState<IGameConfig>(defaultGameConfig);

  const getPlayerConfig = (
    gameConfig: IGameConfig,
    socketId: string
  ): IPlayerConfig | undefined => {
    for (const team of gameConfig.teams) {
      const player = team.players.find(
        (player: IPlayerConfig) => player.userId === socketId
      );
      if (player) {
        return player;
      }
    }
    return undefined;
  };

  // this one will be used when changing anything colorwise
  const [myPlayerConfig, setMyPlayerConfig] =
    React.useState<IPlayerConfig>(defaultPlayerConfig);

  const [input, setInput] = React.useState<string>("1");

  const [owner, setOwner] = React.useState<string>("name");

  const parentRef = React.useRef<HTMLDivElement>(null);

  useListener(
    "update-config-changes",
    (data: IGameConfig) => {
      setGameConfig(data);
    },
    []
  );

  useListener("STARTGAME", (data: IGameConfig) => {
    if (!parentRef.current) return;
    console.log(`!!!`);
    setGame(new UIGame(socket, parentRef.current, data));
  });
  useListener(
    "STARTMOVING",
    () => {
      if (!parentRef.current) return;
      console.log(`Room: ${game?.roomId}`);
      game?.start();
    },
    [game]
  );

  useListener(
    "movements",
    (
      data: {
        tag: string;
        position: number[];
      }[]
    ) => {
      game?.handleMovements(data);
    },
    [game]
  );

  const createRoom = React.useCallback(() => {
    socket.emit("create-room", { game: gameConfig, player: myPlayerConfig });
    socket.once(
      "create-room",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
          console.log(data.teams[0].players[0]);
          const newPlayerConf = getPlayerConfig(data, socket.id);
          if (newPlayerConf) setMyPlayerConfig(newPlayerConf);
        }
      }
    );
  }, [socket, gameConfig, myPlayerConfig, setGameConfig, setMyPlayerConfig]);

  const joinRoom = React.useCallback(() => {
    socket.emit("join-room", { roomId: input, player: myPlayerConfig });
    socket.once("join-room", (error: string, data: IGameConfig | undefined) => {
      if (!parentRef.current) return;
      if (data == undefined) {
        alert(error);
      } else {
        setGameConfig(data);
        const newPlayerConf = getPlayerConfig(data, socket.id);
        if (newPlayerConf) setMyPlayerConfig(newPlayerConf);
      }
    });
  }, [socket, input, myPlayerConfig, setGameConfig, setMyPlayerConfig]);

  const joinTeam = React.useCallback(() => {
    socket.emit("join-team");
    socket.once("join-team", (error: string, data: IGameConfig | undefined) => {
      if (data == undefined) {
        alert(error);
      } else {
        setGameConfig(data);
        const newPlayerConf = getPlayerConfig(data, socket.id);
        if (newPlayerConf) setMyPlayerConfig(newPlayerConf);
      }
    });
  }, [socket]);

  const readyPlayer = React.useCallback(() => {
    socket.emit("ready-player");
    socket.once(
      "ready-player",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
          console.log("READY");
        }
      }
    );
  }, [socket]);

  const getRooms = React.useCallback(() => {
    socket.emit("get-rooms");
    socket.once("get-rooms", (error: string, rooms: string[] | undefined) => {
      if (rooms == undefined) {
        alert(error);
      } else {
        console.log(rooms);
      }
    });
  }, [socket]);

  const leaveRoom = React.useCallback(() => {
    socket.emit("leave-room", input);
    socket.once(
      "leave-room",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          if (game) {
            game.shutdown();
            setGame(null);
          } else if (data !== defaultGameConfig)
            setGameConfig(defaultGameConfig);
        }
      }
    );
  }, [socket, game, input]);

  const switchPosition = React.useCallback(() => {
    socket.emit("switch-position", input);
    socket.once(
      "switch-position",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
        }
      }
    );
  }, [socket, input]);

  const startGame = React.useCallback(() => {
    socket.emit("start-game", game?.roomId);
    socket.once(
      "start-game",
      (error: string, data: IGameConfig | undefined) => {
        if (!parentRef.current) return;
        if (data == undefined) {
          alert(error);
        }
      }
    );
  }, [socket, parentRef, game?.roomId]);

  const switchTeam = React.useCallback(() => {
    socket.emit("switch-team", input);
    socket.once(
      "switch-team",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
        }
      }
    );
  }, [socket, input]);

  const switchPartyOwner = React.useCallback(() => {
    socket.emit("switch-party-owner", owner);
    socket.once(
      "switch-party-owner",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
        }
      }
    );
  }, [socket, owner]);

  const joinSpectators = React.useCallback(() => {
    socket.emit("join-spectator");
    socket.once(
      "join-spectators",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
          console.log("SPECTATOR");
        }
      }
    );
  }, [socket]);

  return (
    <div ref={parentRef}>
      <h1>Pong {`${game?.socket.connected}`}</h1>
      <h1>My Id: {`${socket.id}`}</h1>
      <h1>Room: {`${gameConfig.roomId}`}</h1>
      <h2>Party Owner: {`${gameConfig.partyOwnerId}`}</h2>
      <h1>Team 1:</h1>
      <h3>
        P1: {`${gameConfig?.teams[0]?.players[0]?.userId}`} || Ready:
        {`${gameConfig?.teams[0]?.players[0]?.ready}`}
      </h3>
      <h3>
        P2: {`${gameConfig?.teams[0]?.players[1]?.userId}`} || Ready:
        {`${gameConfig?.teams[0]?.players[1]?.ready}`}
      </h3>
      <h1>Team 2</h1>
      <h3>
        P1: {`${gameConfig?.teams[1]?.players[0]?.userId}`} || Ready:
        {`${gameConfig?.teams[1]?.players[0]?.ready}`}
      </h3>
      <h3>
        P2: {`${gameConfig?.teams[1]?.players[1]?.userId}`} || Ready:
        {`${gameConfig?.teams[1]?.players[1]?.ready}`}
      </h3>
      <h2>
        Spectators: {`${gameConfig?.spectators.map((spec) => spec.userId)}`}
      </h2>

      <Input value={input} onChange={(event) => setInput(event.target.value)} />
      <Input value={owner} onChange={(event) => setOwner(event.target.value)} />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "50%",
          gap: ".2rem",
        }}
      >
        <button onClick={createRoom}>Create Room</button>
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={joinSpectators}>Enter Spectator</button>
        <button onClick={joinTeam}>Enter a Team</button>
        <button onClick={readyPlayer}>Ready</button>
        <button onClick={leaveRoom}>Leave room</button>
        <button onClick={getRooms}>Get Rooms</button>
        <button onClick={switchPosition}>Switch FrontBack</button>
        <button onClick={switchTeam}>Switch Team</button>
        <button onClick={switchPartyOwner}>Switch Party Owner</button>
        <button onClick={startGame}>START GAME</button>
        <button>STOP GAME</button>

        <button>Change Special Power</button>
        <button>Change Line Color</button>
        <button>Change Background Color</button>
        <button>Change Ball Color</button>
        <button>Change Paddle Color</button>
      </div>
    </div>
  );
}
