import bindRefs from '@hooks/bindRefs';
import { Box, BoxProps } from '@mui/joy';
import React, { useRef } from 'react';

export interface InfiniteScrollProps {
  children: React.ReactNode;
  next: () => void;
  hasMore: boolean;
  loader: React.ReactNode;
  endMessage?: React.ReactNode;
  inverse?: boolean;
  hasChildren?: boolean;
  boxProps?: BoxProps;
}

const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  (props, parentRef) => {
    const {
      children,
      inverse = false,
      next,
      hasMore,
      loader,
      endMessage,
      boxProps,
    } = props;
    const observableRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [showLoader, setShowLoader] = React.useState(false);

    const divRef = bindRefs(ref, parentRef);

    const onChange = React.useCallback<IntersectionObserverCallback>(
      (entries) => {
        if (!hasMore) {
          // if (ref.current)
          //   if (inverse) ref.current.scrollTop = 0;
          //   else ref.current.scrollTop = ref.current.scrollHeight;
          return;
        }
        const target = entries[0];
        console.log(target);

        if (target.isIntersecting) {
          next();
          setShowLoader(true);
        }
      },
      [hasMore, next]
    );

    const [observer, setObserver] = React.useState(
      () => new IntersectionObserver(onChange /* { root: ref.current } */)
    );

    React.useEffect(() => {
      setObserver((prev) => {
        prev.disconnect();
        return new IntersectionObserver(onChange);
      });
    }, [onChange]);

    React.useEffect(() => {
      const { current } = observableRef;

      if (current) observer.observe(current);

      return () => {
        if (current) observer.unobserve(current);
      };
    }, [observer, observableRef]);

    React.useEffect(() => {
      const { current } = ref;
      // setObserver((prev) => {
      //   prev.disconnect();
      //   return new IntersectionObserver(onChange, { root: current });
      // });
      // console.log(current);

      if (!current) return;
      // console.log(current.scrollHeight);

      if (inverse) current.scrollTop = 0;
      else current.scrollTop = current.scrollHeight;
    }, [inverse]);

    React.useEffect(() => {
      setShowLoader(false);
      if (observableRef.current) {
        observer.unobserve(observableRef.current);
        observer.observe(observableRef.current);
      }
      // if (!hasMore) {
      //   if (ref.current) {
      //     if (inverse) ref.current.scrollTop = ref.current.scrollHeight;
      //     else ref.current.scrollTop = 0;
      //   }
      // }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children]);
    const hasChildren =
      props.hasChildren ||
      !!(children && Array.isArray(children) && children.length);

    console.log(
      !showLoader && !hasChildren && hasMore,
      showLoader && hasMore,
      !hasMore,
      {
        showLoader,
        hasChildren,
        hasMore,
      }
    );

    return (
      <Box
        sx={{
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          p: 2,
          flexDirection: inverse ? 'column-reverse' : 'column',
        }}
      >
        {!inverse && (
          <>
            {!showLoader && !hasChildren && hasMore && loader}
            {showLoader && hasMore && loader}
            {!hasMore && endMessage}
          </>
        )}

        <Box
          ref={divRef}
          style={{
            display: 'flex',
            flexDirection: inverse ? 'column-reverse' : 'column',
          }}
          {...boxProps}
        >
          {!inverse && (
            <div ref={observableRef} style={{ height: 1, margin: 0 }} />
          )}
          <React.Suspense fallback={loader}>{children}</React.Suspense>
          {inverse && (
            <div ref={observableRef} style={{ height: 1, margin: 0 }} />
          )}
        </Box>
        {inverse && (
          <>
            {!showLoader && !hasChildren && hasMore && loader}
            {showLoader && hasMore && loader}
            {!hasMore && endMessage}
          </>
        )}
      </Box>
    );
  }
);

export default InfiniteScroll;
