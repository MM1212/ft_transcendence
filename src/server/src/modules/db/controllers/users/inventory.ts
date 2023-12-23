import { Inject, Injectable, forwardRef } from "@nestjs/common";
import InventoryModel from "@typings/models/users/inventory";
import { Users } from ".";
import { PrismaService } from "../../prisma";
import { Prisma } from "@prisma/client";

@Injectable()
export class UserInventory {
  constructor(
    @Inject(forwardRef(() => Users)) private readonly users: Users
  ) {}
  private get prisma(): PrismaService {
    // @ts-expect-error impl
    return this.users.prisma;
  }
  public formatItem<
    T extends InventoryModel.DTO.DB.IItem | null,
    U = T extends null ? null : InventoryModel.Models.IItem
  >(item: T): U {
    if (!item) return null as unknown as U;
    const formatted: InventoryModel.Models.IItem = {
      ...item,
    } as unknown as InventoryModel.Models.IItem;
    formatted.createdAt = item.createdAt.getTime();
    return formatted as U;
  }

  public async create(
    userId: number,
    type: string,
    name: string,
    meta: Record<string, unknown> = {},
  ): Promise<InventoryModel.Models.IItem> {
    return this.formatItem(
      await this.prisma.item.create({
        data: {
          userId,
          type,
          name,
          meta: meta as any,
        },
      }),
    );
  }

  public async update(
    id: number,
    data: Prisma.XOR<Prisma.ItemUpdateInput, Prisma.ItemUncheckedUpdateInput>,
  ): Promise<InventoryModel.Models.IItem> {
    return this.formatItem(
      await this.prisma.item.update({
        where: { id },
        data,
      }),
    );
  }

  public async delete(id: number): Promise<void> {
    await this.prisma.item.delete({ where: { id } });
  }
  public async deleteByType(userId: number, type: string): Promise<void> {
    await this.prisma.item.deleteMany({ where: { userId, type } });
  }
  public async deleteByName(userId: number, name: string): Promise<void> {
    await this.prisma.item.deleteMany({ where: { userId, name } });
  }
  public async deleteAll(userId: number): Promise<void> {
    await this.prisma.item.deleteMany({ where: { userId } });
  }
}