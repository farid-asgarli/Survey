import mock_auth_response from "./mock-auth.json";

type UserAuthDetails = {
  profile: {
    fullName: string | undefined;
    username: string | undefined;
    imageUrl: string;
    position: string;
  };
  accessToken: {
    content: string;
    exp: number;
  };
};

export async function SignInMockAsync(onSuccess?: (graphUserAuthDetails: UserAuthDetails, accessToken: string) => void) {
  const artificialDelayInSeconds = 0;

  const { token } = mock_auth_response["sso-response"].data;

  const graphUserAuthDetails: UserAuthDetails = {
    accessToken: {
      content: token,
      exp: 9999999999,
    },
    profile: {
      fullName: "John Doe",
      username: "jd@pasha-life.az",
      position: "TBA",
      imageUrl: "",
    },
  };
  return new Promise<UserAuthDetails>((res) => {
    setTimeout(() => {
      onSuccess?.(graphUserAuthDetails, token);
      res(graphUserAuthDetails);
    }, artificialDelayInSeconds * 1000);
  });
}
