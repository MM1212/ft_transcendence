import { Injectable } from "@nestjs/common";
import { Pong } from "./pong";

@Injectable()
export class Games {
  constructor(public readonly pong: Pong) {}

}
