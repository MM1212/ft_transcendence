export namespace SSE {
  export type User = number;

  export enum Events {
    Test = 'test',
  }

  // TEMPORARY

  export interface Event<T = unknown, E = Events> {
    type: E;
    data: T;
    source?: User;
  }

  export interface SourceEvent<T = unknown, E = Events> extends Event<T, E> {
    source: User;
  }

  export namespace Payloads {
    export type Test = SourceEvent<
      {
        user: {
          id: number;
          name: string;
          avatar: string;
        };
        message: string;
      },
      Events.Test
    >;
  }
}
