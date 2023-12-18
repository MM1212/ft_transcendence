export interface IClassLifeCycle {
  destructor?(): Promise<void>;
  onMount?(): Promise<void>;
  onUpdate?(delta: number): Promise<void>;
}

export interface IClassFeedbackLifeCycle extends Omit<IClassLifeCycle, 'onUpdate'> {
  onUpdate?(delta: number): Promise<boolean>;
}