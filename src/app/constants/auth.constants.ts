export const AUTH_CONSTANTS = {
  // Storage keys
  STORAGE_KEYS: {
    USER_DATA: 'auth_user_data',
    SESSION_TIMESTAMP: 'auth_session_timestamp'
  },
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    WHOAMI: '/auth/whoami'
  },
  
  // Timeouts and delays
  TIMEOUTS: {
    LOGIN_NAVIGATION_DELAY: 100,
    SESSION_CHECK_INTERVAL: 300000, // 5 minutes
    SESSION_WARNING_TIME: 300000, // 5 minutes before expiry
    REQUEST_TIMEOUT: 30000 // 30 seconds
  },
  
  // Routes
  ROUTES: {
    LOGIN: '/login',
    HOME: '/home',
    DEFAULT_REDIRECT: '/home'
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'בעיית רשת. אנא נסה שוב.',
    INVALID_CREDENTIALS: 'שם משתמש או סיסמה שגויים.',
    SESSION_EXPIRED: 'תוקף ההתחברות פג. אנא התחבר מחדש.',
    UNAUTHORIZED: 'אין לך הרשאה לגשת לדף זה.',
    SERVER_ERROR: 'שגיאת שרת. אנא נסה שוב מאוחר יותר.',
    UNKNOWN_ERROR: 'אירעה שגיאה לא צפויה.'
  },
  
  // Session management
  SESSION: {
    MAX_IDLE_TIME: 3600000, // 1 hour in milliseconds
    REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
    STORAGE_ENCRYPTION_KEY: 'auth_encryption_key_v1'
  }
} as const;

export type AuthConstantsType = typeof AUTH_CONSTANTS;
