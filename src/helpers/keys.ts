import * as ed from "@noble/ed25519";
import * as Types from "../helpers/types";

// Generate Ed25519 keypair
export const GenerateKeyPair = async (): Promise<Types.EdKeys> => {
    const privKey = ed.utils.randomPrivateKey();
    const pubKey = await ed.getPublicKeyAsync(privKey);
    return {
        privateKey: privKey,
        publicKey: pubKey,
    };
};

// Generate signature
export const GenerateSignature = async (
    authCode: string,
    privkey: Uint8Array
): Promise<any> => {
    const signature = await ed.signAsync(authCode, privkey);

    return {
        data: signature,
    };
};
