import { Injectable } from '@nestjs/common';
import { PongLobby } from '../ponglobbies/ponglobby';
import User from '../users/user';
import PongModel from '@typings/models/pong';

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

  private joinWaitingUsers(waintingQ: Queue<PongLobby>) {
    while (waintingQ.size() > 1)
    {
      //TODO: call match lobbies;
      waintingQ.dequeue();
      //TODO: destroy next queue before dequeue because he is joined to previous
      waintingQ.dequeue();
    }
  }

  constructor() {
    setInterval(() => {
      this.joinWaitingUsers(this.queue1x1);
      this.joinWaitingUsers(this.queue2x2);
    }, 3000);
  }

  public addToQueue(pongLobby: PongLobby, user: User) {
    //TODO: verify no already waiting lobby
    if (pongLobby.queueType === PongModel.Models.LobbyType.Single)
      this.queue1x1.enqueue(pongLobby);
    else this.queue2x2.enqueue(pongLobby);
  }
}
