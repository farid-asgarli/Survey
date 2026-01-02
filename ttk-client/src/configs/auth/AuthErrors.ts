import { StatusMessages } from '@src/static/messages/statusMessages';

export const AuthErrors = {
  no_account_internal: 'E-poçt adresinə uyğun istifadəçi hesabı tapılmadı.<br/> Zəhmət olmasa administratorla əlaqə saxlayın.',
  no_account: StatusMessages.AuthNoAccount,
  user_cancelled: StatusMessages.AuthUserCancelled,
  popup_window_error:
    "Brauzerinizdə 'Pop-up' bağlıdır.<br/> Zəhmət olmasa daxil ola bilmək üçün 'Pop-up' bloklanmasını ləğv edin. Ətraflı: <a target='_blank' href='https://support.google.com/chrome/answer/95472?hl=en&co=GENIE.Platform%3DDesktop'>Popup-ın aktiv edilməsi</a>",
  sso_network_error: 'SSO Serverlə əlaqə yaratmaq mümkün olmadı (Adres tapılmadı)',
};

export enum AuthErrorCodes {
  MSAL,
  SSO_USER_NOT_FOUND,
  SSO_NO_CONNECTION,
  UNKNOWN,
}

export class AuthNetworkError extends Error {}
