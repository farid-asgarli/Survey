import Root from '@src/components/interface/Root/Root';
import AppUiProvider from '@src/configs/app/AppUiProvider';
import AuthConfigProvider from '@src/configs/auth/AuthConfigProvider';
import RoutingProvider from '@src/configs/routing/RoutingProvider';
import { DataContextProvider } from '@src/data/query-manager';

import { ApplicationStoreProvider } from '@src/store';

import * as Sentry from '@sentry/react';

export default function Application() {
  if (import.meta.env.MODE !== 'development') {
    Sentry.init({
      dsn: 'https://d0a3c1f3c1991fa5157772c19953aea6@sentry-v2.pasha-life.az/23',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: true,
        }),
      ],
      release: 'GHS@' + import.meta.env.VITE_APP_VERSION,
      replaysSessionSampleRate: 1.0,
      replaysOnErrorSampleRate: 1.0,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      enabled: true,
      profilesSampleRate: 1.0,
    });
  }

  return (
    <ApplicationStoreProvider>
      <DataContextProvider>
        <AuthConfigProvider>
          <AppUiProvider>
            <Root>
              <RoutingProvider />
            </Root>
          </AppUiProvider>
        </AuthConfigProvider>
      </DataContextProvider>
    </ApplicationStoreProvider>
  );
}
