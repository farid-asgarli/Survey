import { AxiosInstance, AxiosResponse } from 'axios';

const responseBody = <T>(response: AxiosResponse<Models.ServiceResponse<T>>) => response.data.data;

function requests(axiosInstance: AxiosInstance, controllerName: string) {
  return {
    get: <T>(url: string) => axiosInstance.get<Models.ServiceResponse<T>>(controllerName + '/' + url).then(responseBody),
    post: <T>(url: string, body: {} = {}) =>
      axiosInstance.post<Models.ServiceResponse<T>>(controllerName + '/' + url, body).then(responseBody),
    put: <T>(url: string, body: {} = {}) =>
      axiosInstance.put<Models.ServiceResponse<T>>(controllerName + '/' + url, body).then(responseBody),
    del: <T>(url: string) => axiosInstance.delete<Models.ServiceResponse<T>>(controllerName + '/' + url).then(responseBody),
  };
}

export function setupApiInstance(instance: AxiosInstance) {
  return function <TRequestCollection>(name: string, req: (r: ReturnType<typeof requests>) => TRequestCollection) {
    return req(requests(instance, name));
  };
}
