import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PongLobby } from '../ponglobbies/ponglobby';
import User from '../users/user';
import PongModel from '@typings/models/pong';
import { PongLobbyService } from '../ponglobbies/ponglobby.service';
import { UsersService } from '../users/services/users.service';

interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  size(): number;
}

class Queue<T> implements IQueue<T> {
  public storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Queue has reached max capacity, you cannot add more items');
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  size(): number {
    return this.storage.length;
  }
}

@Injectable()
export class PongQueueService {
  private queue1x1 = new Queue<PongLobby>();
  private queue2x2 = new Queue<PongLobby>();

  constructor(
    private lobbyService: PongLobbyService,
    private userService: UsersService,
  ) {
    setInterval(() => {
      this.joinWaitingUsers(this.queue1x1);
      this.joinWaitingUsers(this.queue2x2);
    }, 3000);
  }

  private async joinWaitingUsers(waintingQ: Queue<PongLobby>) {
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
      })
      
      this.lobbyService.startGame(receiver.teams[0].players[0].id, receiver.id);
    }
  }

  public addToQueue(pongLobby: PongLobby, user: User) {
    if (pongLobby.queueType === PongModel.Models.LobbyType.Single)
      this.queue1x1.enqueue(pongLobby);
    else if (pongLobby.queueType === PongModel.Models.LobbyType.Double)
      this.queue2x2.enqueue(pongLobby);
    else console.error("Custom lobby shouldn't be queued");
  }
}
