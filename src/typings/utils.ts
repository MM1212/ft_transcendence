export type GroupEnumValues<T extends string> = T extends string
  ? `${T}`
  : never;

export type GroupEnumKeys<T extends Record<string, string>> = T extends Record<
  string,
  string
>
  ? keyof T
  : never;
