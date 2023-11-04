import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  GroupEndpointTargets,
} from '@typings/api/base/endpoint';

namespace SseModel {
  export namespace Models {
    export type User = number;

    export type Events = 'test';

    export interface Event<T = unknown, E extends string = string> {
      type: E;
      data: T;
      source?: User;
    }

    export interface SourceEvent<T = unknown, E extends string = string>
      extends Event<T, E> {
      source: User;
    }

    // TEMPORARY
    export interface TestMessage {
      user: {
        id: number;
        name: string;
        avatar: string;
      };
      message: string;
    }
  }
  export namespace DTO {
    export interface TestPost {
      message: string;
    }
    export interface Test
      extends Models.SourceEvent<Models.TestMessage, 'test'> {}
  }
  export namespace Endpoints {
    export enum Targets {
      Connect = '/sse',
      Test = '/sse/test',
    }
    export type All = GroupEndpointTargets<Targets>;
    export interface Connect
      extends Endpoint<
        EndpointMethods.Get,
        Targets.Connect,
        undefined,
        undefined
      > {}
    export interface Test
      extends Endpoint<
        EndpointMethods.Post,
        Targets.Test,
        undefined,
        DTO.TestPost,
        { message: string }
      > {}

    /* export interface Registry {
      [Targets.Connect]: Connect;
      [Targets.Test]: Test;
    } */
    export type Registry = {
      [EndpointMethods.Get]: {
        [Targets.Connect]: Connect;
      };
      [EndpointMethods.Post]: {
        [Targets.Test]: Test;
      };
    }
  }
}

export default SseModel;
