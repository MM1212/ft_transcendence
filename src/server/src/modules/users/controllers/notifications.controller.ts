import HttpCtx from '@/helpers/decorators/httpCtx';
import { Auth } from '@/modules/auth/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { InternalEndpointResponse } from '@typings/api';
import { HTTPContext } from '@typings/http';
import NotificationsModel from '@typings/models/notifications';

@Auth()
@Controller()
export class UsersNotificationsController {
  constructor() {}

  @Get(NotificationsModel.Endpoints.Targets.GetAll)
  async getAll(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<NotificationsModel.Endpoints.GetAll>> {
    return user.notifications.raw;
  }

  @Delete(NotificationsModel.Endpoints.Targets.DeleteOne)
  async deleteOne(
    @HttpCtx() { user }: HTTPContext<true>,
    @Param('notifId', new ParseIntPipe()) notifId: number,
  ): Promise<InternalEndpointResponse<NotificationsModel.Endpoints.DeleteOne>> {
    const notification = user.notifications.get(notifId);
    if (!notification) throw new NotFoundException('Notification not found');
    await notification.delete(true);
  }

  @Delete(NotificationsModel.Endpoints.Targets.DeleteAll)
  async deleteAll(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<InternalEndpointResponse<NotificationsModel.Endpoints.DeleteAll>> {
    await user.notifications.deleteAll();
  }

  @Put(NotificationsModel.Endpoints.Targets.MarkAsRead)
  async markAsRead(
    @HttpCtx() { user }: HTTPContext<true>,
    @Param('notifId', new ParseIntPipe()) notifId: number,
    @Body('read', new ParseBoolPipe()) read: boolean,
  ): Promise<
    InternalEndpointResponse<NotificationsModel.Endpoints.MarkAsRead>
  > {
    const notification = user.notifications.get(notifId);
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.read === read) return;
    if (read) await notification.markAsRead();
    else await notification.markAsUnread();
  }

  @Post(NotificationsModel.Endpoints.Targets.MarkAllAsRead)
  async markAllAsRead(
    @HttpCtx() { user }: HTTPContext<true>,
  ): Promise<
    InternalEndpointResponse<NotificationsModel.Endpoints.MarkAllAsRead>
  > {
    await user.notifications.markAllAsRead();
  }
}
