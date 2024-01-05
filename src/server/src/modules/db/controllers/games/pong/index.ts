import { Injectable } from "@nestjs/common";
import { PongHistory } from "./history";

@Injectable()
export class Pong {
  constructor(
    public readonly history: PongHistory
  ) {}
}