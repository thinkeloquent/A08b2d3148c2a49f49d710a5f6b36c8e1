import { AuthType } from '@internal/auth-encoding';

export interface AuthConfig {
    type: AuthType;
    username?: string;
    password?: string;
    email?: string;
    token?: string;
    baseUrl?: string;
    headerName?: string;
    headerValue?: string;
}

export interface AuthConfigInput extends AuthConfig {
    encode?: boolean;
}

export interface AuthConfigWithHeaders extends AuthConfig {
    headers: Record<string, string>;
}
