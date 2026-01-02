import { Outlet } from 'react-router-dom';
import styles from './Layout.module.scss';
import Aside from '../Aside/Aside';
import { Page } from '../Page';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/store';
import clsx from 'clsx';
import { Loaders } from '../Loaders';
import { Notifications } from '@mantine/notifications';
import { CommandCenter } from '../CommandCenter/CommandCenter';
import React from 'react';
import { ModalsProvider } from '@mantine/modals';
import NetworkDialog from '../NetworkDialog/NetworkDialog';
import Dialog from '../Dialog/Dialog';
import PdfViewer from '../PdfViewer/PdfViewer';
import Drawer from '../Drawer/Drawer';

function Layout() {
  const { sidebarExpanded, appFetching } = useStore('misc');

  return (
    <React.Fragment>
      <ModalsProvider>
        <div className={styles.root}>
          <Aside />
          <main className={clsx(styles['root-inner'], sidebarExpanded && styles.collapsed)}>
            <Loaders.ProgressBar visible={appFetching} />
            <Page.Wrapper>
              <Page.Header />
              <Page.Body>
                <Outlet />
              </Page.Body>
            </Page.Wrapper>
          </main>
        </div>
        <Drawer />
        <Dialog />
        <PdfViewer />
      </ModalsProvider>
      <Notifications maw="max-content" position="top-center" />
      <NetworkDialog />
      <CommandCenter />
    </React.Fragment>
  );
}

export default observer(Layout);
