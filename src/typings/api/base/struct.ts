// Default struct for all modules to extend from

import { Endpoint, EndpointMethods, GroupEndpointTargets } from './endpoint';

namespace TestModel {
  export namespace Models {
    export interface Test1 {
      id: number;
      name: string;
    }
    export interface Test2 {
      id: number;
      name: string;
    }
  }
  export namespace DTO {
    export interface GetTest1 extends Models.Test1 {}
    export interface PatchTest2 extends Models.Test2 {}
  }
  export namespace Endpoints {
    export enum Targets {
      Test1 = '/test1',
      Test2 = '/test2',
    }
    export type All = GroupEndpointTargets<Targets>;
    export interface Test1
      extends Endpoint<
        EndpointMethods.Get,
        Targets.Test1,
        DTO.GetTest1,
        undefined
      > {}
    export interface Test2
      extends Endpoint<
        EndpointMethods.Patch,
        Targets.Test2,
        DTO.PatchTest2,
        undefined
      > {}
    export interface Registry {
      [Targets.Test1]: Test1;
      [Targets.Test2]: Test2;
    };
  }
  export namespace Sse {
    // Sse events
  }
  export namespace Socket {}
}
