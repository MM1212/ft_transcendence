import {
  Endpoint,
  EndpointMethods,
  GetEndpoint,
  GroupEndpoints,
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
    export type All = GroupEndpoints<Targets>;
    export interface Login extends GetEndpoint<Targets.Login, undefined> {}
    export interface Logout extends GetEndpoint<Targets.Logout, undefined> {}

    export interface Session
      extends GetEndpoint<Targets.Session, DTO.Session> {}
  }
  export namespace Sse {}
}

export default AuthModel;
