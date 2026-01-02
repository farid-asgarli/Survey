declare namespace Models {
  interface ServiceResponse<T> extends BaseResponse {
    data: T;
  }

  interface BaseResponse {
    statusCode: number;
    requestId: string;
    message: string;
  }
}
