type EnvironmentModes = 'development' | 'alpha' | 'beta' | 'production';

function getEnvVar(name: string) {
  return import.meta.env[`VITE_${name}`];
}

export default class Environment {
  static SSO_AUTH = {
    INTERNAL_URI: getEnvVar('SSO_AUTH_INTERNAL_URI'),
    CLIENT_ID: getEnvVar('SSO_AUTH_CLIENT_ID'),
    AUTHORITY: getEnvVar('SSO_AUTH_AUTHORITY'),
    REDIRECT_URI: getEnvVar('SSO_AUTH_REDIRECT_URI'),
    AUTH_SCOPES: JSON.parse(getEnvVar('SSO_AUTH_SCOPES')),
  };
  static IsDevelopment: boolean = import.meta.env.DEV;
  static BASE_PATH: string = import.meta.env.APP_BASE_PATH;
  static BASE_API_URI: string = getEnvVar('BASE_API_URI');
  static BASE_URI: string = getEnvVar('BASE_URI');
  static PROFILE_URI: string = getEnvVar('USER_PROFILE_URI');
  static PAGE_TITLE: string = getEnvVar('APP_TITLE');
  static APP_DESCRIPTION: string = getEnvVar('APP_DESCRIPTION');
  static MODE: EnvironmentModes = import.meta.env.MODE as EnvironmentModes;
  static NETWORK_DELAY_MS = +getEnvVar('APP_NETWORK_DELAY_MS');
  static CLS_PREFIX = getEnvVar('CLS_PREFIX');
  static APP_ACCENT_COLOR = getEnvVar('APP_ACCENT_COLOR');
  static SOCKET_URI = getEnvVar('APP_SOCKET_URI');
}
