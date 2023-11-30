export type TPenguinAnimationDirection =
  | 'down'
  | 'down-left'
  | 'left'
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'right'
  | 'down-right';

export type TPenguinAnimationSets = 'idle' | 'walk' | 'seat' | 'snowball';

export type IPenguinAnimationSetTypes<
  K extends TPenguinAnimationSets = TPenguinAnimationSets,
  T extends TPenguinAnimationDirection = TPenguinAnimationDirection
> = `${K}/${T}`;

export type IPenguinBaseAnimationsTypes =
  | IPenguinAnimationSetTypes<'idle'>
  | IPenguinAnimationSetTypes<'walk'>
  | IPenguinAnimationSetTypes<'seat'>
  | 'wave'
  | 'dance'
  | IPenguinAnimationSetTypes<
      'snowball',
      Exclude<TPenguinAnimationDirection, 'down' | 'left' | 'top' | 'right'>
    >;
