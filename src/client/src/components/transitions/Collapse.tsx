import React from 'react';
import { useSpring, animated, AnimationConfig } from '@react-spring/web';

interface CollapseProps extends Required<React.PropsWithChildren<{}>> {
  opened: boolean;
  config?: AnimationConfig;
}

const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ children, opened, config = { duration: 200 } }, ref) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const styles = useSpring({
      height: opened ? divRef?.current?.scrollHeight : 0,
      opacity: opened ? 1 : 0,
      transform: opened ? 'translateY(0)' : 'translateY(-10px)',
      overflow: opened ? 'visible' : 'hidden',
      config,
    });

    ref = ref || divRef;

    return (
      <animated.div style={styles} ref={divRef}>
        {children}
      </animated.div>
    );
  }
);

export default Collapse;
