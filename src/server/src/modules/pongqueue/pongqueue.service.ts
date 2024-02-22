import { Injectable } from '@nestjs/common';
import { PongLobby } from '../ponglobbies/ponglobby';
import User from '../users/user';
import PongModel from '@typings/models/pong';
import { PongLobbyService } from '../ponglobbies/ponglobby.service';
import { UsersService } from '../users/services/users.service';

interface IQueue<T> {
  enqueue(item: T, priority: number): void;
  dequeue(): T | undefined;
  size(): number;
}

interface IQueueItem<T> {
  item: T;
  priority: number;
}

class PriorityQueue<T> implements IQueue<T> {
  public storage: IQueueItem<T>[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T, priority: number): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
    }
    this.storage.push({ item, priority });
    this.storage.sort((a, b) => {
      return a.priority - b.priority;
    });
  }
  dequeue(): T | undefined {
    return this.storage.shift()?.item;
  }
  size(): number {
    return this.storage.length;
  }
}

@Injectable()
export class PongQueueService {
  private queue1x1 = new PriorityQueue<PongLobby>();
  private queue2x2 = new PriorityQueue<PongLobby>();

  constructor(
    private lobbyService: PongLobbyService,
    private userService: UsersService,
  ) {
    setInterval(() => {
      this.joinWaitingUsers(this.queue1x1);
      this.joinWaitingUsers(this.queue2x2);
    }, 3000);
  }

  public async leaveQueue(lobby: PongLobby, userId: number): Promise<void> {
    if (lobby.queueType === PongModel.Models.LobbyType.Single) {
      this.queue1x1.storage = this.queue1x1.storage.filter(
        (l) => l.item.id !== lobby.id,
      );
    } else if (lobby.queueType === PongModel.Models.LobbyType.Double) {
      this.queue2x2.storage = this.queue2x2.storage.filter(
        (l) => l.item.id !== lobby.id,
      );
    }
    await this.lobbyService.leaveLobby(userId, true);
  }

  private async joinWaitingUsers(waintingQ: PriorityQueue<PongLobby>) {
    while (waintingQ.size() > 1) {
      const receiver = waintingQ.dequeue();
      const provider = waintingQ.dequeue();
      if (!receiver || !provider) return;

      for (const p of provider.teams[0].players) {
        await this.lobbyService.leaveLobby(p.id, true);
        const user = await this.userService.get(p.id);
        if (!user) {
          console.error('error');
          continue;
        }
        await this.lobbyService.joinLobby(
          user,
          receiver.id,
          receiver.authorization,
          receiver.nonce,
          true,
        );
      }

      receiver.allPlayers.forEach((p) => {
        p.status = PongModel.Models.LobbyStatus.Ready;
      });

      this.lobbyService.startGame(receiver.teams[0].players[0].id, receiver.id);
    }
  }

  public addToQueue(pongLobby: PongLobby, user: User) {
    if (pongLobby.queueType === PongModel.Models.LobbyType.Single)
      this.queue1x1.enqueue(pongLobby, user.elo.rating);
    else if (pongLobby.queueType === PongModel.Models.LobbyType.Double)
      this.queue2x2.enqueue(pongLobby, user.elo.rating);
    else console.error("Custom lobby shouldn't be queued");
  }
}
