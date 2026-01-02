import { useAppState } from '@src/hooks/app/use-app-state';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Loaders } from '../Loaders';

function Root({ children }: { children: React.ReactNode }) {
  const { appInitialized, authenticate, fetchStatus } = useAppState();

  return (
    <React.Fragment>
      <Loaders.Preloader onRetryButtonClick={authenticate} fetchStatus={fetchStatus} visible={!appInitialized} />
      {appInitialized && children}
    </React.Fragment>
  );
}

export default observer(Root);
