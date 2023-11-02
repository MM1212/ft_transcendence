import React from 'react';
import { useSpring, animated, AnimationConfig } from '@react-spring/web';

interface FadeProps extends Required<React.PropsWithChildren<{}>> {
  opened: boolean;
  config?: AnimationConfig;
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(
  ({ children, opened, config = { duration: 200 } }, ref) => {
    const styles = useSpring({
      opacity: opened ? 1 : 0,
      config,
    });

    return (
      <animated.div style={styles} ref={ref}>
        {children}
      </animated.div>
    );
  }
);

export default Fade;
