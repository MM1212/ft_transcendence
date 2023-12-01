import {
  Endpoint,
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api/base/endpoint';
import UsersModel from '../users';

namespace AuthModel {
  export namespace Models {
    export interface TFA {
      enabled: boolean;
      secret?: string;
    }
  }
  export namespace DTO {
    export interface Session extends UsersModel.Models.IUserInfo {
      tfaEnabled: boolean;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      Login = '/auth/42/login',
      Logout = '/auth/42/logout',
      Session = '/me',
      TfaSetup = '/auth/tfa',
      TfaQrCode = '/auth/tfa/qr',
      TfaSetupConfirm = '/auth/tfa/confirm',
      TfaDisable = '/auth/tfa/disable',
      IsLoggingInTFA = '/auth/tfa/check',
      TfaCallback = '/auth/tfa/callback',
    }
    export type All = GroupEndpointTargets<Targets>;
    export interface Login extends GetEndpoint<Targets.Login, undefined> {}
    export interface Logout extends GetEndpoint<Targets.Logout, undefined> {}

    export interface Session
      extends GetEndpoint<Targets.Session, DTO.Session> {}

    export interface TfaQrCode extends GetEndpoint<Targets.TfaQrCode, string> {}
    export interface TfaSetup
      extends Endpoint<
        EndpointMethods.Post,
        Targets.TfaSetup,
        string,
        undefined,
        undefined
      > {}

    export interface TfaSetupConfirm
      extends Endpoint<
        EndpointMethods.Post,
        Targets.TfaSetupConfirm,
        undefined,
        { code: string },
        undefined
      > {}

    export interface TfaDisable
      extends Endpoint<
        EndpointMethods.Post,
        Targets.TfaDisable,
        undefined,
        { code: string },
        undefined
      > {}

    export interface IsLoggingInTFA
      extends GetEndpoint<Targets.IsLoggingInTFA, boolean> {}

    export interface TfaCallback
      extends Endpoint<
        EndpointMethods.Post,
        Targets.TfaCallback,
        undefined,
        { code: string }
      > {}

    export type Registry = {
      [EndpointMethods.Get]: {
        [Targets.Login]: Login;
        [Targets.Logout]: Logout;
        [Targets.Session]: Session;
        [Targets.TfaQrCode]: TfaQrCode;
        [Targets.IsLoggingInTFA]: IsLoggingInTFA;
      };
      [EndpointMethods.Post]: {
        [Targets.TfaSetup]: TfaSetup;
        [Targets.TfaSetupConfirm]: TfaSetupConfirm;
        [Targets.TfaDisable]: TfaDisable;
        [Targets.TfaCallback]: TfaCallback;
      };
    };
  }
  export namespace Sse {}
}

export default AuthModel;
