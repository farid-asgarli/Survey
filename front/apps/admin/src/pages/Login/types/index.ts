export interface FormErrors {
  email?: string;
  password?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
