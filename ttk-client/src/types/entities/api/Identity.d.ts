declare namespace Models {
  declare namespace Identity {
    interface ImageRequest {
      username: string;
      accessToken: string;
    }
    interface AuthenticateSSOResponse {
      token: string;
      username: string;
      fullName: string;
      positionName: string;
      base64Photo: string;
      accesses: Array<string>;
    }
  }
}
