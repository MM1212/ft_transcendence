namespace QuestsModel {
  export namespace Models {
    export interface IQuest<
      T extends Record<string, unknown> = Record<string, unknown>
    > {
      id: number;
      userId: number;
      tag: string;
      createdAt: number;
      updatedAt: number;
      finishedAt?: number;
      completed: boolean;
      meta: Record<string, unknown>;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface IQuest
        extends Omit<
          Models.IQuest,
          'createdAt' | 'updatedAt' | 'finishedAt' | 'meta'
        > {
        createdAt: Date;
        updatedAt: Date;
        finishedAt: Date | null;
        meta: any;
      }
    }
  }
}

export default QuestsModel;
