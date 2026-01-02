import { displayNetworkDialog } from '@src/components/interface/NetworkDialog/NetworkDialog';
import { store } from '@src/store';
import { InternalAxiosRequestConfig } from 'axios';

export function requestHandlerMiddleware(config: InternalAxiosRequestConfig<any>) {
  if (!navigator.onLine) {
    displayNetworkDialog();
    return config;
  }

  if (store.user.accessToken?.content) config.headers.Authorization = `Bearer ${store.user.accessToken.content}`;

  store.misc.startAppFetching();
  return config;
}
