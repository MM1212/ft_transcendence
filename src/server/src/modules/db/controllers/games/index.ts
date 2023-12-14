import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma";
import PongModel from "@typings/models/pong";
import { JsonObject } from "@prisma/client/runtime/library";

@Injectable()
export class Games {
  constructor(private readonly prisma: PrismaService) {}

}
