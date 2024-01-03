import { Injectable } from '@nestjs/common';
import { PongLobby, PongLobbyParticipant } from '../ponglobbies/ponglobby';
import User from '../users/user';
import PongModel from '@typings/models/pong';
import { PongService } from '../ponggame/pong.service';
import { PongLobbyService } from '../ponglobbies/ponglobby.service';

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

  constructor(private serviceRef: PongLobbyService) {
    setInterval(() => {
      this.joinWaitingUsers(this.queue1x1);
      this.joinWaitingUsers(this.queue2x2);
    }, 3000);
  }

  private joinWaitingUsers(waintingQ: Queue<PongLobby>) {
    while (waintingQ.size() > 1) {
      const receiver = waintingQ.dequeue();
      const provider = waintingQ.dequeue();
      if (!receiver || !provider) return;

      provider.teams[0].players.forEach((p) => {
        this.serviceRef.leaveLobby(p.id);
        receiver.addPlayerToPlayers(p as PongLobbyParticipant);
      });
    }
  }

  public addToQueue(pongLobby: PongLobby, user: User) {
    if (pongLobby.queueType === PongModel.Models.LobbyType.Single)
      this.queue1x1.enqueue(pongLobby);
    else if (pongLobby.queueType === PongModel.Models.LobbyType.Double)
      this.queue2x2.enqueue(pongLobby);
    else console.log("Custom lobby shouldn't be queued");
  }
}
