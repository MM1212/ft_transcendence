import { Endpoint, EndpointMethods, GetEndpoint, SseModel } from '@typings/api';
import { GroupEnumValues } from '@typings/utils';

namespace NotificationsModel {
  export namespace Models {
    export enum Types {
      Permanent = 'PERMANENT',
      Temporary = 'TEMPORARY',
    }
    export enum Tags {}
    export interface Notification<T = unknown> {
      id: number;
      title: string;
      message: string;
      type: GroupEnumValues<Types>;
      tag: Tags | string;
      data: T;
      read: boolean;
      createdAt: number;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface Notification
        extends Omit<Models.Notification, 'data' | 'createdAt'> {
        data: any;
        createdAt: Date;
      }
    }

    export interface GetParams extends Record<string, unknown> {
      id: number;
    }

    export interface DoActionParams extends GetParams {
      action: string;
    }

    export interface DoAction extends Record<string, unknown> {}

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
      GetAll = '/notifications',
      GetOne = '/notifications/:id',
      DeleteOne = '/notifications/:id',
      DeleteAll = '/notifications',
      DoAction = '/notifications/:id/action/:action',
      MarkAllAsRead = '/notifications/read',
    }
    export type All = GroupEnumValues<Targets>;

    export interface GetAll
      extends GetEndpoint<
        Targets.GetAll,
        Models.Notification[],
        DTO.GetParams
      > {}

    export interface GetOne
      extends GetEndpoint<Targets.GetOne, Models.Notification, DTO.GetParams> {}

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

    export interface DoAction
      extends Endpoint<
        EndpointMethods.Post,
        Targets.DoAction,
        undefined,
        DTO.DoAction,
        DTO.DoActionParams
      > {}

    export interface MarkAllAsRead
      extends Endpoint<
        EndpointMethods.Post,
        Targets.MarkAllAsRead,
        undefined,
        undefined
      > {}

    export interface Registry {
      [EndpointMethods.Get]: {
        [Targets.GetAll]: GetAll;
        [Targets.GetOne]: GetOne;
      };
      [EndpointMethods.Delete]: {
        [Targets.DeleteOne]: DeleteOne;
        [Targets.DeleteAll]: DeleteAll;
      };
      [EndpointMethods.Post]: {
        [Targets.DoAction]: DoAction;
      };
    }
  }
  export namespace Sse {
    export enum Events {
      SendAlert = 'notifications.send-alert',
    }

    export interface SendAlertEvent
      extends SseModel.Models.Event<DTO.Alert, Events.SendAlert> {}
  }
}

export default NotificationsModel;
