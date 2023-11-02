import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api/base/endpoint';
import { IUser } from '@typings/user';

namespace AuthModel {
  export namespace Models {}
  export namespace DTO {
    export interface Session extends IUser {}
  }
  export namespace Endpoints {
    export enum Targets {
      Login = '/auth/42/login',
      Logout = '/auth/42/logout',
      Session = '/auth/session',
    }
    export type All = GroupEndpointTargets<Targets>;
    export interface Login extends GetEndpoint<Targets.Login, undefined> {}
    export interface Logout extends GetEndpoint<Targets.Logout, undefined> {}

    export interface Session
      extends GetEndpoint<Targets.Session, DTO.Session> {}

    export type Registry =  {
      [EndpointMethods.Get]: {
        [Targets.Login]: Login;
        [Targets.Logout]: Logout;
        [Targets.Session]: Session;
      };
    };
  }
  export namespace Sse {}
}

export default AuthModel;
