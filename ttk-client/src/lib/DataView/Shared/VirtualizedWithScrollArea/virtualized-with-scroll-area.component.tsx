import { Virtuoso as VirtualList, VirtuosoHandle } from 'react-virtuoso';
import throttle from 'lodash.throttle';
import { useRef, useState, useCallback } from 'react';
import styles from './virtualized-with-scroll-area.module.scss';
import { VirtualizedViewWithScrollAreaProps } from './virtualized-with-scroll-area.props';
import clsx from 'clsx';
import { useEventListener } from '@src/hooks/common/use-event-listener';
import { Paper } from '@mantine/core';
import { useTheme } from '@src/hooks/app/use-theme';
import { withForwardedRef } from '@src/types/lib/react';

function VirtualizedViewWithScrollArea<TModel>(props: VirtualizedViewWithScrollAreaProps<TModel>, ref: React.ForwardedRef<VirtuosoHandle>) {
  const theme = useTheme();

  const horizontalPadding = 'var(--scrollbar-width)';

  const virtualScrollerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isScrollbarVisible, setIsScrollbarVisible] = useState(false);

  const checkScrollbarVisibility = useCallback(() => {
    if (virtualScrollerRef.current && containerRef.current) {
      const isScrollable = containerRef.current.scrollHeight <= virtualScrollerRef.current.clientHeight;
      setIsScrollbarVisible(isScrollable);
    }
  }, []);

  const setContainerRef = useCallback(
    (node: typeof virtualScrollerRef.current) => {
      virtualScrollerRef.current = node;
      checkScrollbarVisibility();
    },
    [checkScrollbarVisibility]
  );

  useEventListener('resize', throttle(checkScrollbarVisibility, 500));

  return (
    <Paper
      pl={horizontalPadding}
      py="xs"
      pos="relative"
      w="100%"
      h="100%"
      bg={theme.colorScheme === 'dark' ? theme.theme.colors.gray[9] : '#fff'}
      ref={containerRef}
      {...props.containerProps}
      className={clsx(styles['virtual-list-wrapper'], props.containerProps?.className)}
    >
      {isScrollbarVisible && <div className={styles['scrollbar-mask']} />}
      <VirtualList
        ref={ref}
        overscan={5}
        {...props.virtualListProps}
        components={{
          List: withForwardedRef((props, listRef) => (
            <div
              ref={(node) => {
                setContainerRef(node);
                if (typeof listRef === 'function') listRef(node);
                else if (listRef) (listRef.current as typeof virtualScrollerRef.current) = node;
              }}
              {...props}
            />
          )),
          ...props.virtualListProps.components,
        }}
      />
    </Paper>
  );
}

export default withForwardedRef(VirtualizedViewWithScrollArea);
