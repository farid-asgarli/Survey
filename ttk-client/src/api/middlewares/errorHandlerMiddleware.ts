import { displayAccessDialog } from '@src/components/interface/Dialog/Dialog';
import { AccessMethod } from '@src/static/entities/access-method';
import { store } from '@src/store';
import { Notifications } from '@src/utils/notification';
import { AxiosError, AxiosResponse } from 'axios';

export function errorResponseHandlerMiddleware(error: AxiosError<Models.ServiceResponse<null>>) {
  const { response } = error;
  if (response) {
    if (response.status === 403) {
      const invalidAuthData = (response as unknown as AxiosResponse<Models.ServiceResponse<Models.InvalidAccessResponse>>)?.data?.data;
      if (invalidAuthData?.accessMethod === AccessMethod.Entry)
        throw new Error(
          `Üzr istəyirik, sizin ${invalidAuthData.accessName} hüququnuz yoxdur. Zəhmət olmasa adminstratorla əlaqə saxlayın.`
        );
      displayAccessDialog(invalidAuthData.accessName);
    } else if (response.status === 401) {
      Notifications.warning('Sessiya bitmişdir. Səhifə yenilənir...');
      setTimeout(() => window.location.reload(), 2000);
    } else Notifications.error(response.data.message);
  } else Notifications.error('Serverlə əlaqə yaradan zaman xəta baş verdi');
  store.misc.stopAppFetching();

  return Promise.reject(error);
}
