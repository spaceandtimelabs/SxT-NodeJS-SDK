import nacl from "tweetnacl";
// https://www.npmjs.com/package/tweetnacl#naclsignkeypair
// Nacl Sign keypair uses ed25519 algorithm by default

let keyPair = nacl.sign.keyPair();
let { publicKey, secretKey } = keyPair;

let ED25519PublicKeyUint = publicKey
let ED25519PrivateKeyUint = secretKey //required for signature generation and is of the form Uint8

let b64PublicKey = Buffer.from(publicKey).toString('base64');
let b64PrivateKey = Buffer.from(secretKey.slice(0,32)).toString('base64');
let hexEncodedPublicKey = Buffer.from(publicKey).toString("hex");
let hexEncodedPrivateKey = Buffer.from(secretKey.slice(0,32)).toString("hex");
let biscuitPrivateKey = hexEncodedPrivateKey;

export {
    ED25519PublicKeyUint,
    ED25519PrivateKeyUint,
    b64PublicKey,
    b64PrivateKey,
    hexEncodedPublicKey,
    hexEncodedPrivateKey,
    biscuitPrivateKey,
}




