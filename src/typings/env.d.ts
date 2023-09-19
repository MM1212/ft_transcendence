interface ImportMetaEnv {
  readonly DOMAIN: string;
  readonly BIND_IP: string;
  readonly BACKEND_PORT: number;
  readonly BACKEND_URL: string;
  readonly FRONTEND_PORT: number;
  readonly FRONTEND_HOST: string;
  readonly FRONTEND_URL: string;
  readonly FRONTEND_API_ENDPOINT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
