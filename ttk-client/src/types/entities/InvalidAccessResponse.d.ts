declare namespace Models {
  interface InvalidAccessResponse {
    accessName: string;
    accessMethod: import('@src/static/entities/access-method').AccessMethod;
  }
}
