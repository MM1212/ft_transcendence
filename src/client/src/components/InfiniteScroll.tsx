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
    const lastNextPromiseRef = useRef<Promise<any> | null>(null);

    const divRef = bindRefs(ref, parentRef);

    const onChange = React.useCallback<IntersectionObserverCallback>(
      async (entries) => {
        if (!hasMore) {
          // if (ref.current)
          //   if (inverse) ref.current.scrollTop = 0;
          //   else ref.current.scrollTop = ref.current.scrollHeight;
          return;
        }

        const target = entries[0];
        console.log(target);

        if (target.isIntersecting) {
          lastNextPromiseRef.current = Promise.resolve(next());
          setShowLoader(true);
        }
      },
      [hasMore, next]
    );

    const [observer, setObserver] = React.useState(
      () => new IntersectionObserver(onChange /* { root: ref.current } */)
    );

    React.useLayoutEffect(() => {
      setObserver((prev) => {
        prev.disconnect();
        return new IntersectionObserver(onChange);
      });
    }, [onChange]);

    React.useLayoutEffect(() => {
      const { current } = observableRef;

      if (current) observer.observe(current);

      return () => {
        if (current) observer.unobserve(current);
      };
    }, [observer, observableRef]);

    React.useLayoutEffect(() => {
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

    const firstMount = React.useRef(true);

    React.useLayoutEffect(() => {
      firstMount.current = false;
    }, []);

    React.useLayoutEffect(() => {
      setShowLoader(false);
      if (observableRef.current && !firstMount.current) {
        console.log('refreshing observer');

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

    /* console.log(
      !showLoader && !hasChildren && hasMore,
      showLoader && hasMore,
      !hasMore,
      {
        showLoader,
        hasChildren,
        hasMore,
      }
    ); */

    const intersector = React.useMemo(
      () => (
        <div
          ref={observableRef}
          style={{ height: 1, margin: 0 }}
          className="intersector"
        />
      ),
      []
    );

    return React.useMemo(
      () => (
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
            {!inverse && intersector}
            <React.Suspense fallback={loader}>{children}</React.Suspense>
            {inverse && intersector}
          </Box>
          {inverse && (
            <>
              {!showLoader && !hasChildren && hasMore && loader}
              {showLoader && hasMore && loader}
              {!hasMore && endMessage}
            </>
          )}
        </Box>
      ),
      [
        boxProps,
        children,
        divRef,
        endMessage,
        hasChildren,
        hasMore,
        intersector,
        inverse,
        loader,
        showLoader,
      ]
    );
  }
);

export default InfiniteScroll;
