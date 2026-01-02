import { AuthenticationResult } from '@azure/msal-common';
import { useMsal } from '@azure/msal-react';
import { MimeTypes } from '@src/static/file';
import { decodeJwt } from '@src/utils/decodeJwt';
import { FileFns } from '@src/utils/fileFns';
import { useEffect, useRef, useState } from 'react';
import { AuthConfig } from './AuthConfig';
import { BrowserAuthError, InteractionStatus, SilentRequest } from '@azure/msal-browser';
import { AuthErrorCodes, AuthErrors, AuthNetworkError } from './AuthErrors';
import { agent } from '@src/api/agent';
import ApplicationUser from '@src/types/models/user';
import { AppAccessType } from '@src/static/app-accesses';
import { AxiosError } from 'axios';

type UserAuthDetails = {
  profile: ApplicationUser;
  accessToken: {
    content: string;
    exp: number;
  };
};

interface AuthenticationInstanceProps {
  onSuccessfulSignIn?: (userAuthDetails: UserAuthDetails, msGraphRefreshDetails: AuthenticationResult) => Promise<void> | void;
  onErrorSignIn?: (errorMessage: string, code: AuthErrorCodes, retry?: boolean) => void;
}

export default function useAuthInstance(authenticationType: 'redirect' | 'popup', props: AuthenticationInstanceProps) {
  const msal = useMsal();
  const tokenAutoRefreshTimer = useRef<NodeJS.Timeout | null>(null);
  const [signInInitiated, setSignInInitiated] = useState(false);

  function createUserAuthDetails(internalAuthResponse: Models.Identity.AuthenticateSSOResponse): UserAuthDetails {
    const decodedUserInfo = decodeJwt<Models.SSO.TokenDetails>(internalAuthResponse.token);
    return {
      profile: {
        fullName: internalAuthResponse.fullName,
        username: internalAuthResponse.username,
        position: internalAuthResponse.positionName,
        imageUrl: FileFns.base64ToFileUrl(internalAuthResponse.base64Photo, MimeTypes.png),
        accesses: internalAuthResponse.accesses as Array<AppAccessType>,
      },
      accessToken: {
        content: internalAuthResponse.token,
        exp: decodedUserInfo.exp,
      },
    };
  }

  async function authenticateSilentlyPopupAsync() {
    const request: SilentRequest = {
      ...AuthConfig.loginRequest,
      account: msal.accounts[0],
    };
    try {
      return await msal.instance.acquireTokenSilent(request);
    } catch (error) {
      return await msal.instance.acquireTokenPopup(request);
    }
  }

  async function authenticateSilentlyRedirectAsync() {
    const request: SilentRequest = {
      ...AuthConfig.loginRequest,
      account: msal.accounts[0],
    };
    try {
      return await msal.instance.acquireTokenSilent(request);
    } catch (error) {
      return await msal.instance.acquireTokenRedirect(request);
    }
  }

  async function getSSOAccountInfo(token: string): Promise<Models.Identity.AuthenticateSSOResponse> {
    try {
      // if (Environment.IsDevelopment) return await _devFetchInternal();

      const fetchResult = await agent.Identity.AuthenticateSSO(token);

      return fetchResult;
    } catch (error) {
      console.log(error);
      if (error instanceof Error && navigator.onLine && error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new AuthNetworkError(AuthErrors.sso_network_error);
      } else throw error;
    }
  }

  async function retrieveRefreshToken() {
    const request: SilentRequest = {
      scopes: ['https://graph.microsoft.com/User.ReadBasic.All', 'openid', 'profile', 'offline_access'],
      account: msal.accounts[0],
    };
    return await msal.instance.acquireTokenSilent(request);
  }

  function scheduleTokenAutoRefresh(exp: number) {
    clearAutoRefreshTimer();
    const timeAdvanceInMs = 5 * 60 * 1000;
    const timeDiffInMs = exp * 1000 - (Date.now() + timeAdvanceInMs);
    tokenAutoRefreshTimer.current = setTimeout(() => setSignInInitiated(true), timeDiffInMs);
  }

  function clearAutoRefreshTimer() {
    if (tokenAutoRefreshTimer.current) {
      clearTimeout(tokenAutoRefreshTimer.current);
      tokenAutoRefreshTimer.current = null;
    }
  }

  async function signInPopupAsync() {
    const graphUserAuthDetails = await authenticateSilentlyPopupAsync();
    if (graphUserAuthDetails.account) msal.instance.setActiveAccount(graphUserAuthDetails.account);

    const refreshTokenDetails = await retrieveRefreshToken();
    const internalSsoResponse = await getSSOAccountInfo(graphUserAuthDetails.accessToken);

    if (!internalSsoResponse.token) {
      props?.onErrorSignIn?.(AuthErrors.no_account_internal, AuthErrorCodes.SSO_USER_NOT_FOUND, false);
      return;
    }

    const generatedUserData = createUserAuthDetails(internalSsoResponse);

    await props?.onSuccessfulSignIn?.(generatedUserData, refreshTokenDetails);

    scheduleTokenAutoRefresh(generatedUserData.accessToken.exp);

    return graphUserAuthDetails;
  }

  async function signInRedirectAsync() {
    const graphUserAuthDetails = await authenticateSilentlyRedirectAsync();

    if (graphUserAuthDetails) {
      const refreshTokenDetails = await retrieveRefreshToken();
      const internalSsoResponse = await getSSOAccountInfo(graphUserAuthDetails.accessToken);

      if (!internalSsoResponse.token) {
        props?.onErrorSignIn?.(AuthErrors.no_account_internal, AuthErrorCodes.SSO_USER_NOT_FOUND, false);
        return;
      }

      const generatedUserData = createUserAuthDetails(internalSsoResponse);

      props?.onSuccessfulSignIn?.(generatedUserData, refreshTokenDetails);

      scheduleTokenAutoRefresh(generatedUserData.accessToken.exp);

      return graphUserAuthDetails;
    }
  }

  async function signInAsync() {
    try {
      if (authenticationType === 'redirect') await signInRedirectAsync();
      else if (authenticationType === 'popup') await signInPopupAsync();
      else throw new Error(`Invalid authentication type: ${authenticationType}`);
    } catch (error) {
      if (error instanceof BrowserAuthError)
        props?.onErrorSignIn?.(AuthErrors[error.errorCode as keyof typeof AuthErrors] ?? error.errorMessage, AuthErrorCodes.MSAL, true);
      else if (error instanceof AuthNetworkError) props.onErrorSignIn?.(error.message, AuthErrorCodes.SSO_NO_CONNECTION, false);
      else if (error instanceof AxiosError) props.onErrorSignIn?.(error.response?.data?.message, AuthErrorCodes.UNKNOWN, false);
      else props?.onErrorSignIn?.((error as Error)?.message, AuthErrorCodes.UNKNOWN, true);
    } finally {
      setSignInInitiated(false);
    }
  }

  useEffect(() => {
    if (signInInitiated && msal.inProgress === InteractionStatus.None) signInAsync();
  }, [msal.inProgress, signInInitiated]);

  return () => setSignInInitiated(true);
}
