export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export type ArrayKey = number;

export type IsTuple<T extends readonly any[]> = number extends T['length']
  ? false
  : true;

export type TupleKeys<T extends readonly any[]> = Exclude<keyof T, keyof any[]>;

export type PathConcat<
  TKey extends string | number,
  TValue
> = TValue extends Primitive
  ? `${TKey}`
  : `${TKey}` | `${TKey}.${Path<TValue>}`;

export type Path<T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: PathConcat<K & string, T[K]>;
      }[TupleKeys<T>]
    : PathConcat<ArrayKey, V>
  : {
      [K in keyof T]-?: PathConcat<K & string, T[K]>;
    }[keyof T];

export type ArrayPathConcat<
  TKey extends string | number,
  TValue
> = TValue extends Primitive
  ? never
  : TValue extends readonly (infer U)[]
  ? U extends Primitive
    ? never
    : `${TKey}` | `${TKey}.${ArrayPath<TValue>}`
  : `${TKey}.${ArrayPath<TValue>}`;

export type ArrayPath<T> = T extends readonly (infer V)[]
  ? IsTuple<T> extends true
    ? {
        [K in TupleKeys<T>]-?: ArrayPathConcat<K & string, T[K]>;
      }[TupleKeys<T>]
    : ArrayPathConcat<ArrayKey, V>
  : {
      [K in keyof T]-?: ArrayPathConcat<K & string, T[K]>;
    }[keyof T];

export type PathValue<T, TPath extends Path<T> | ArrayPath<T>> = T extends any
  ? TPath extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? undefined extends T[K]
          ? PathValue<T[K], R> | undefined
          : PathValue<T[K], R>
        : never
      : K extends `${ArrayKey}`
      ? T extends readonly (infer V)[]
        ? PathValue<V, R & Path<V>>
        : never
      : never
    : TPath extends keyof T
    ? T[TPath]
    : TPath extends `${ArrayKey}`
    ? T extends readonly (infer V)[]
      ? V
      : never
    : never
  : never;

export type PathSet<T> = T | PathSetter<T>;
export type PathSetter<T> = (value: T) => T;

export type NestedPartial<T> = T extends any
  ? {
      [K in keyof T]?: T[K] extends Primitive
        ? T[K]
        : NestedPartial<T[K]>;
    }
  : never;
