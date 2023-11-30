const isMergebleObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

const deepMerge = <T>(target: any, ...sources: object[]): T => {
  if (!sources.length) return target as T;
  const source: any = sources.shift();
  if (source === undefined) return target as T;
  if (isMergebleObject(target) && isMergebleObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isMergebleObject(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }
  return deepMerge(target, ...sources);
};

export default deepMerge;