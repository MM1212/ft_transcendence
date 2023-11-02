import React from 'react';

const bindRefs = <T>(
  ...refs: (React.MutableRefObject<T> | React.ForwardedRef<T>)[]
) => {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) ref.current = value;
    });
  };
};

export default bindRefs;
