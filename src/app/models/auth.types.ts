export interface UserData {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  [key: string]: any;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  user_details?: UserData;
  [key: string]: any;
}

export interface WhoAmIResponse {
  user_details: UserData;
  [key: string]: any;
}

export interface AuthError {
  error: string;
  message?: string;
  status?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  error: string | null;
}

export enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AuthLoadingState {
  login: boolean;
  logout: boolean;
  refresh: boolean;
  initialization: boolean;
}
