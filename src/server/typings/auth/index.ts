export namespace Auth {
  export interface Token {
    access_token: string;
    token_type: string;
    expires_in: number;
    created_at: number;
    refresh_token: string;
    scope: string;
    secret_valid_until: number;
  }
}
