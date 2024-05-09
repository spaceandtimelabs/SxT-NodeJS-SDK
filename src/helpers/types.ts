// Response format for generating Ed25519 key pair
export interface EdKeys {
    privateKey: Uint8Array;
    publicKey: Uint8Array;
}

// All API response format
export interface APIResponse {
    error?: Error;
    data?: any;
}

// Biscuit generation input
export interface BiscuitCapabilities {
    operation?: string;
    resource: string;
}

// Access token data
export interface AccessTokenObject {
    accessToken: string;
    refreshToken: string;
    sessionExpires: number;
    accessTokenExpires: number;
    refreshTokenExpires: number;
}
