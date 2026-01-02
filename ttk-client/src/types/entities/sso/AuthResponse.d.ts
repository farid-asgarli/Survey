declare namespace Models {
  namespace SSO {
    interface AuthResponse
      extends Models.ServiceResponse<{
        token: string;
        base64Photo: string;
      }> {}
    interface TokenDetails {
      Department_Id: string;
      Division_Id: string;
      Email: string;
      Id: string;
      Name: string;
      Position_Id: string;
      Position_name: string;
      Surname: string;
      aud: string;
      exp: number;
      iss: string;
    }
  }
}
