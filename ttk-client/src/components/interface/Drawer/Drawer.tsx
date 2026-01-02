import React, { createRef, useImperativeHandle, useState } from 'react';
import { DrawerProps as MantineDrawerProps, Drawer as MantineDrawer, ScrollArea } from '@mantine/core';
import { Proxify } from '@src/utils/proxy';
import { merge } from '@src/utils/merge';

interface DrawerInnerState {
  visible: boolean;
  title: React.ReactNode | undefined;
  body: React.ReactNode | undefined;
  props?: Omit<MantineDrawerProps, 'opened' | 'onClose'>;
}

const DefaultDrawerState: DrawerInnerState = {
  visible: false,
  body: undefined,
  title: undefined,
  props: { size: 'xl' },
};

interface OpenDrawerProps extends Partial<Omit<DrawerInnerState, 'visible'>> {}

interface DrawerRef {
  open(props: OpenDrawerProps): void;
  close(): void;
  update(props: Partial<OpenDrawerProps>): void;
}

const drawerRef = createRef<DrawerRef>();

export const drawer = Proxify(drawerRef);

export default function Drawer() {
  const [drawerState, setDrawerState] = useState<DrawerInnerState>(DefaultDrawerState);

  useImperativeHandle(
    drawerRef,
    () => ({
      close,
      open,
      update,
    }),
    []
  );

  function open(props: OpenDrawerProps) {
    setDrawerState(merge(DefaultDrawerState, props, { visible: true }));
  }

  function close() {
    setDrawerState((prev) => ({ ...prev, visible: false }));
    destroy();
  }

  function update(props: Partial<OpenDrawerProps>) {
    setDrawerState((prev) => merge(prev, props));
  }

  function destroy() {
    setDrawerState(DefaultDrawerState);
  }

  return (
    <MantineDrawer
      position="right"
      opened={drawerState.visible}
      onClose={close}
      {...drawerState.props}
      title={drawerState.title}
      transitionProps={{ timingFunction: 'ease' }}
      closeButtonProps={merge({ iconSize: 20 }, drawerState.props?.closeButtonProps)}
      scrollAreaComponent={ScrollArea.Autosize}
      styles={merge(
        {
          title: {
            fontSize: 20,
            fontWeight: 700,
          },
          header: {
            padding: '1.5rem 1rem',
          },
        },
        drawerState.props?.styles
      )}
    >
      {drawerState.body}
    </MantineDrawer>
  );
}
