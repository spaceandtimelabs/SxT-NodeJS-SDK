import nacl from "tweetnacl";
import { PrivateKey, biscuit, block, Biscuit } from "@biscuit-auth/biscuit-wasm";
import * as Types from "../helpers/types.js";

interface KeyPairResult {
    privateKey_64: Uint8Array;
    publicKey_32: Uint8Array;
    privateKeyB64_64: string;
    publicKeyB64_32: string;
    biscuitPrivateKeyHex_32: string;
    biscuitPublicKeyHex_32: string;
}

export class Authorization {
    private static readonly encoder = new TextEncoder();

    /**
     * Creates a biscuit token from given capabilities
     */
    public createBiscuitToken(
        capabilities: Types.BiscuitCapabilities[],
        privKey: string
    ): Types.APIResponse {
        try {
            let biscuitBuilder = biscuit``;
            
            // Use forEach instead of reduce since we're modifying the builder in place
            capabilities.forEach(cap => {
                const biscuitBlock = block`sxt:capability(${cap.operation}, ${cap.resource})`;
                biscuitBuilder = biscuitBuilder.merge(biscuitBlock);
            });

            const token = biscuitBuilder
                .build(PrivateKey.fromString(privKey))
                .toBase64();

            return { data: [token] };
        } catch (error) {
            throw new Error(`Failed to create biscuit token: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates a wildcard biscuit token
     */
    public createWildcardBiscuitToken(
        capabilities: Types.BiscuitCapabilities,
        privKey: string
    ): Types.APIResponse {
        try {
            const biscuitBuilder = biscuit``;
            const biscuitBlock = block`sxt:capability(*, ${capabilities.resource})`;
            
            const token = biscuitBuilder
                .merge(biscuitBlock)
                .build(PrivateKey.fromString(privKey))
                .toBase64();

            return { data: [token] };
        } catch (error) {
            throw new Error(`Failed to create wildcard biscuit token: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates an Ed25519 keypair
     */
    public async generateKeyPair(): Promise<KeyPairResult> {
        try {
            const { publicKey, secretKey } = nacl.sign.keyPair();
            const trimmedSecretKey = secretKey.slice(0, 32);

            return {
                privateKey_64: secretKey,
                publicKey_32: publicKey,
                privateKeyB64_64: Buffer.from(secretKey).toString("base64"),
                publicKeyB64_32: Buffer.from(publicKey).toString("base64"),
                biscuitPrivateKeyHex_32: Buffer.from(trimmedSecretKey).toString("hex"),
                biscuitPublicKeyHex_32: Buffer.from(publicKey).toString("hex"),
            };
        } catch (error) {
            throw new Error(`Failed to generate keypair: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates an Ed25519 keypair from provided credentials
     */
    public generateKeyPairFromString(keypair: Types.Credentials): KeyPairResult {
        try {
            return {
                privateKey_64: Uint8Array.from(Buffer.from(keypair.privateKeyB64_64, "base64")),
                publicKey_32: Uint8Array.from(Buffer.from(keypair.publicKeyB64_32, "base64")),
                privateKeyB64_64: keypair.privateKeyB64_64,
                publicKeyB64_32: keypair.publicKeyB64_32,
                biscuitPrivateKeyHex_32: keypair.biscuitPrivateKeyHex_32,
                biscuitPublicKeyHex_32: keypair.biscuitPublicKeyHex_32,
            };
        } catch (error) {
            throw new Error(`Failed to generate keypair from string: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates a signature for the given auth code
     */
    public async generateSignature(
        authCode: string,
        privKey: string
    ): Promise<{ signature: string }> {
        try {
            const message = Authorization.encoder.encode(authCode);
            const privateKey = Uint8Array.from(Buffer.from(privKey, "hex"));
            const signatureArray = nacl.sign(message, privateKey);
            
            return {
                signature: Buffer.from(signatureArray).toString("hex").slice(0, 128),
            };
        } catch (error) {
            throw new Error(`Failed to generate signature: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Converts a 64-byte private key to 32-byte format
     */
    public convertKey64To32(pvtKey: string): string {
        try {
            const bytes = Uint8Array.from(Buffer.from(pvtKey, "base64"));
            return Buffer.from(bytes.slice(0, 32)).toString("base64");
        } catch (error) {
            throw new Error(`Failed to convert 64-byte key to 32-byte: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Converts a 32-byte private key to 64-byte format
     */
    public convertKey32To64(pvtKey: string, pubKey: string): string {
        try {
            const pvtBytes = Uint8Array.from(Buffer.from(pvtKey, "base64"));
            const pubBytes = Uint8Array.from(Buffer.from(pubKey, "base64"));
            return Buffer.from(new Uint8Array([...pvtBytes, ...pubBytes])).toString("base64");
        } catch (error) {
            throw new Error(`Failed to convert 32-byte key to 64-byte: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
