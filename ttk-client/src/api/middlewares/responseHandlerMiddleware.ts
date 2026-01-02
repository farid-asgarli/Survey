import Environment from '@src/static/env';
import { store } from '@src/store';
import { Notifications } from '@src/utils/notification';
import { sleep } from '@src/utils/task';
import { AxiosResponse } from 'axios';

export async function responseHandlerMiddleware(response: AxiosResponse<Models.ServiceResponse<any>>) {
  if (Environment.IsDevelopment) await sleep(Environment.NETWORK_DELAY_MS);

  if (response.config.method !== 'get' && !response.config.url?.includes('List') && !response.config.url?.includes('Image'))
    Notifications.success(response?.data.message, {
      withCloseButton: false,
    });

  store.misc.stopAppFetching();
  return response;
}
