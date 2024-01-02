interface ImportMetaEnv {
  readonly DOMAIN: string;
  readonly BIND_IP: string;
  readonly BACKEND_PORT: number;
  readonly BACKEND_URL: string;
  readonly BACKEND_CORS_ORIGIN: string;
  readonly BACKEND_SESSION_SECRET: string;
  readonly BACKEND_SESSION_SALT: string;
  readonly BACKEND_42_CLIENT_ID: string;
  readonly BACKEND_42_SECRET: string;
  readonly BACKEND_42_ROOT_URI: string;
  readonly BACKEND_42_REDIRECT_URI: string;
  readonly BACKEND_42_LOGIN_URI: string;
  readonly BACKEND_42_REQUEST_TOKEN_URI: string;
  readonly BACKEND_TFA_ISSUER: string;
  readonly BACKEND_TFA_SECRET_LENGTH: number;
  // CONFIG
  readonly BACKEND_USER_USE_DEFAULT_INTRA_CREDITS: boolean;

  readonly FRONTEND_PORT: number;
  readonly FRONTEND_HOST: string;
  readonly FRONTEND_URL: string;
  readonly FRONTEND_API_ENDPOINT: string;
  readonly FRONTEND_PUBLIC_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
