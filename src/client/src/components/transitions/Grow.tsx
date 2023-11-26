import React from 'react';
import { useSpring, animated, AnimationConfig } from '@react-spring/web';

interface GrowProps extends Required<React.PropsWithChildren<{}>> {
  opened: boolean;
  from?: { left: number; top: number };
  config?: AnimationConfig;
}

const Grow = React.forwardRef<HTMLDivElement, GrowProps>(
  ({ children, opened, config = { duration: 200 }, from = {
    left: 0,
    top: 0
  } }, ref) => {
    const styles = useSpring({
      opacity: opened ? 1 : 0,
      transform: opened ? 'scale(1) translate(0, 0)' : `scale(0) translate(${from.left}px, ${from.top}px)`,
      config,
    });

    return (
      <animated.div style={styles} ref={ref}>
        {children}
      </animated.div>
    );
  }
);

export default Grow;
