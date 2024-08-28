import nacl from "tweetnacl";
import { PrivateKey, biscuit, block } from "@biscuit-auth/biscuit-wasm";

import * as Types from "../helpers/types.js";

export default class Authorization {
    // Create biscuit from the given rules
    CreateBiscuitToken = (
        capabilities: Types.BiscuitCapabilities[],
        privKey: string
    ): Types.APIResponse => {
        let biscuitTokens: string[] = [];
        let biscuitBuilder = biscuit``;

        for (let capabilityObj of capabilities) {
            let biscuitBlock = block`sxt:capability(${capabilityObj.operation}, ${capabilityObj.resource})`;
            biscuitBuilder.merge(biscuitBlock);
        }
        let permissionedBiscuitToken = biscuitBuilder
            .build(PrivateKey.fromString(privKey))
            .toBase64();
        biscuitTokens.push(permissionedBiscuitToken);

        return { data: biscuitTokens };
    };

    // Create wildcard biscuit from the given rules
    CreateWildcardBiscuitToken = (
        capabilities: Types.BiscuitCapabilities,
        privKey: string
    ): Types.APIResponse => {
        let biscuitTokens: string[] = [];
        let biscuitBuilder = biscuit``;

        let biscuitBlock = block`sxt:capability(*, ${capabilities.resource})`;
        biscuitBuilder.merge(biscuitBlock);

        let wildCardBiscuitToken = biscuitBuilder
            .build(PrivateKey.fromString(privKey))
            .toBase64();
        biscuitTokens.push(wildCardBiscuitToken);

        return { data: biscuitTokens };
    };

    // Generate Ed25519 keypair
    GenerateKeyPair = async (): Promise<Types.EdKeys> => {
        const keyPair = nacl.sign.keyPair();
        const { publicKey, secretKey } = keyPair;

        const trimmedSecretKey = secretKey.slice(0, 32);

        return {
            privateKey_64: secretKey,
            publicKey_32: publicKey,
            privateKeyB64_64: Buffer.from(secretKey).toString("base64"),
            publicKeyB64_32: Buffer.from(publicKey).toString("base64"),
            biscuitPrivateKeyHex_32:
                Buffer.from(trimmedSecretKey).toString("hex"),
        };
    };

    // Generate Ed25519 keypair from provided string
    GenerateKeyPairFromString = (keypair: Types.Credentials): Types.EdKeys => {
        return {
            privateKey_64: Uint8Array.from(
                Buffer.from(keypair.privateKeyB64_64, "base64")
            ),
            publicKey_32: Uint8Array.from(
                Buffer.from(keypair.publicKeyB64_32, "base64")
            ),
            privateKeyB64_64: keypair.privateKeyB64_64,
            publicKeyB64_32: keypair.publicKeyB64_32,
            biscuitPrivateKeyHex_32: keypair.biscuitPrivateKeyHex_32,
        };
    };

    // Generate signature
    GenerateSignature = async (
        authCode: Uint8Array,
        privkey: Uint8Array
    ): Promise<any> => {
        const signatureArray = nacl.sign(authCode, privkey);
        let signature = Buffer.from(
            signatureArray.buffer,
            signatureArray.byteOffset,
            signatureArray.byteLength
        ).toString("hex");
        signature = signature.slice(0, 128);

        return {
            signature: signature,
        };
    };

    // Convert private-key-64-bytes to private-key-32-bytes
    // input is base64 encoded private key
    ConvertKey64To32 = (pvtKey: string) => {
        const pvtBinaryString = atob(pvtKey);
        const bytes = new Uint8Array(pvtBinaryString.length);
        for (let i = 0; i < pvtBinaryString.length; i++) {
            bytes[i] = pvtBinaryString.charCodeAt(i);
        }

        const pvtkey32 = bytes.slice(0, 32);
        return Buffer.from(pvtkey32).toString("base64");
    };

    // Convert private-key-32-bytes to private-key-64-bytes
    // input strings are base64 encoded
    ConvertKey32To64 = (pvtKey: string, pubKey: string) => {
        const pvtBinaryString = atob(pvtKey);
        const pvtBytes = new Uint8Array(pvtBinaryString.length);
        for (let i = 0; i < pvtBinaryString.length; i++) {
            pvtBytes[i] = pvtBinaryString.charCodeAt(i);
        }

        const pubBinaryString = atob(pubKey);
        const pubBytes = new Uint8Array(pubBinaryString.length);
        for (let i = 0; i < pubBinaryString.length; i++) {
            pubBytes[i] = pubBinaryString.charCodeAt(i);
        }

        const mergedPvtKey = new Uint8Array([...pvtBytes, ...pubBytes]);
        return Buffer.from(mergedPvtKey).toString("base64");
    };
}
