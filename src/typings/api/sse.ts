export namespace SSE {
  export type User = number;

  export enum Events {
    FacebookNewFriendRequest = 'facebook.friends.new-request',
  }

  // TEMPORARY

  export interface Event<T = unknown, E = Events> {
    type: E;
    data: T;
    source?: User;
  }

  export namespace Payloads {
    export type FacebookNewFriendRequest = Event<
      {
        user: User;
      },
      Events.FacebookNewFriendRequest
    >;
  }
}
