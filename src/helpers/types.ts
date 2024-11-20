// Response format for generating Ed25519 key pair
export interface EdKeys {
    privateKey_64: Uint8Array;
    publicKey_32: Uint8Array;
    privateKeyB64_64: string;
    publicKeyB64_32: string;
    biscuitPrivateKeyHex_32: string;
    biscuitPublicKeyHex_32: string;
}

// All API response format
export interface APIResponse {
    error?: Error | any;
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

// Credentials storage format
export interface Credentials {
    userid: string;
    privateKeyB64_64: string;
    publicKeyB64_32: string;
    resource: string;
    biscuit: string;
    biscuitPrivateKeyHex_32: string;
    biscuitPublicKeyHex_32: string;
}

// Options for a http request
export interface Options {
    method: string;
    url: string;
    headers: any;
    body?: any;
}
