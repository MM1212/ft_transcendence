namespace QuestsModel {
  export namespace Models {
    export interface IUserQuest<
      T extends Record<string, unknown> = Record<string, unknown>
    > {
      id: number;
      userId: number;
      tag: string;
      createdAt: number;
      updatedAt: number;
      finishedAt?: number;
      completed: boolean;
      currentMilestone: number;
      meta: T;
    }

    /**
     * whenever a quest is updated, the milestone is checked by:
     *
     * - checking `quest.meta[quest.config.trackMetaKey] === quest.config.trackMetaValue`
     * - if true, the quest goes to the next milestone or ends
     */
    export interface IQuestMilestone<T = unknown> {
      tag: string;
      questTag: string;
      trackMetaKey: string;
      trackMetaValue: T;
    }

    export interface IQuestConfig<T = unknown> {
      tag: string;
      defaultMeta: Record<string, unknown>;
      trackMetaKey?: string;
      milestones: IQuestMilestone<T>[];
    }

    export type IQuestRawMilestone<T> =
      | T
      | Pick<IQuestMilestone<T>, 'tag' | 'trackMetaValue' | 'trackMetaKey'>;

    export type IQuestRawConfig = Record<string, Omit<IQuestConfig, 'tag'>>;
  }
  export namespace DTO {
    export namespace DB {
      export interface IQuest
        extends Omit<
          Models.IUserQuest,
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
