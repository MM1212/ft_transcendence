import { Endpoint, EndpointMethods, GetEndpoint, SseModel } from '@typings/api';
import { GroupEnumValues } from '@typings/utils';

namespace NotificationsModel {
  export namespace Models {
    export enum Types {
      Permanent = 'PERMANENT',
      Temporary = 'TEMPORARY',
    }
    export enum Tags {
      UserFriendsRequest = 'user.friends.request',
    }
    export interface INotification<
      T extends Record<string, unknown> = Record<string, unknown>
    > {
      id: number;
      title: string;
      message: string;
      type: GroupEnumValues<Types>;
      tag: Tags | string;
      data: T;
      read: boolean;
      createdAt: number;
      userId: number;
      lifetime: number; // in miliseconds, 0 = permanent
      dismissable: boolean;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface Notification
        extends Omit<Models.INotification, 'data' | 'createdAt'> {
        data: any;
        createdAt: Date;
      }
      export interface CreateNotification
        extends Pick<
          NotificationsModel.Models.INotification,
          'title' | 'message' | 'type' | 'lifetime'
        > {
        tag: string;
        data: any;
        dismissable?: boolean;
      }
    }

    export interface GetParams extends Record<string, unknown> {
      notifId: number;
    }

    export interface DoActionParams extends GetParams {
      action: string;
    }

    export interface DoAction extends Record<string, unknown> {}

    export interface CreateNotification<
      T extends Record<string, unknown> = Record<string, unknown>
    > extends Pick<
        NotificationsModel.Models.INotification,
        'title' | 'message' | 'type' | 'tag'
      > {
      data?: T;
      lifetime?: number;
      dismissable?: boolean;
    }

    export type UpdateNotification = Partial<
      Omit<NotificationsModel.Models.INotification, 'id' | 'userId'>
    > & {
      id: number;
      deleted?: boolean;
    };

    export interface Alert {
      variant?: 'solid' | 'soft' | 'outlined' | 'plain';
      color?: 'success' | 'primary' | 'warning' | 'danger' | 'neutral';
      invertedColors?: boolean;
      title: string;
      message: string;
      duration?: number;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      GetAll = '/me/notifications',
      DeleteOne = '/me/notifications/:notifId',
      DeleteAll = '/me/notifications',
      MarkAsRead = '/me/notifications/:notifId/read',
      MarkAllAsRead = '/me/notifications/read',
      DoAction = '/me/notifications/:notifId/action/:action',
    }
    export type All = GroupEnumValues<Targets>;

    export interface GetAll
      extends GetEndpoint<Targets.GetAll, Models.INotification[]> {}

    export interface DeleteOne
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteOne,
        undefined,
        undefined,
        DTO.GetParams
      > {}

    export interface DeleteAll
      extends Endpoint<
        EndpointMethods.Delete,
        Targets.DeleteAll,
        undefined,
        undefined
      > {}

    export interface MarkAsRead
      extends Endpoint<
        EndpointMethods.Post,
        Targets.MarkAsRead,
        undefined,
        { read: boolean },
        DTO.GetParams
      > {}

    export interface MarkAllAsRead
      extends Endpoint<
        EndpointMethods.Post,
        Targets.MarkAllAsRead,
        undefined,
        undefined
      > {}

    export interface DoAction
      extends Endpoint<
        EndpointMethods.Post,
        Targets.DoAction,
        undefined,
        DTO.DoAction,
        DTO.DoActionParams
      > {}

    export interface Registry {
      [EndpointMethods.Get]: {
        [Targets.GetAll]: GetAll;
      };
      [EndpointMethods.Delete]: {
        [Targets.DeleteOne]: DeleteOne;
        [Targets.DeleteAll]: DeleteAll;
      };
      [EndpointMethods.Put]: {
        [Targets.MarkAsRead]: MarkAsRead;
      };
      [EndpointMethods.Post]: {
        [Targets.MarkAllAsRead]: MarkAllAsRead;
        [Targets.DoAction]: DoAction;
      };
    }
  }

  export namespace Sse {
    export enum Events {
      SendAlert = 'notifications.send-alert',
      NewNotification = 'notifications.new-notification',
      UpdateNotification = 'notifications.update-notification',
      SyncNotifications = 'notifications.sync-notifications',
      DeleteNotifications = 'notifications.delete-notifications',
    }

    export interface SendAlertEvent
      extends SseModel.Models.Event<DTO.Alert, Events.SendAlert> {}

    export interface NewNotificationEvent
      extends SseModel.Models.Event<
        Models.INotification,
        Events.NewNotification
      > {}

    export interface SyncNotificationsEvent
      extends SseModel.Models.Event<
        Models.INotification[],
        Events.SyncNotifications
      > {}

    export interface UpdateNotificationEvent
      extends SseModel.Models.Event<
        DTO.UpdateNotification,
        Events.UpdateNotification
      > {}

    export interface DeleteNotificationsEvent
      extends SseModel.Models.Event<
        { ids: number[] },
        Events.DeleteNotifications
      > {}
  }
}

export default NotificationsModel;
