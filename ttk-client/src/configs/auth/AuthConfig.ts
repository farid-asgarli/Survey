import Environment from '@src/static/env';

export const AuthConfig = {
  settings: {
    auth: {
      clientId: Environment.SSO_AUTH.CLIENT_ID,
      authority: Environment.SSO_AUTH.AUTHORITY,
      // This is a URI (e.g. https://login.microsoftonline.com/{your tenant ID})
      redirectUri: Environment.BASE_PATH ? window.origin + Environment.BASE_PATH : Environment.SSO_AUTH.REDIRECT_URI,
    },
    cache: {
      cacheLocation: 'sessionStorage',
      storeAuthStateInCookie: false,
    },
  },
  // Add scopes here for ID token to be used at Microsoft identity platform endpoints.
  loginRequest: {
    scopes: Environment.SSO_AUTH.AUTH_SCOPES,
  },
};
