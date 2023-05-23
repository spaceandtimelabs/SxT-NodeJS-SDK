import nacl from "tweetnacl";
// import base64url from 'base64url';
// https://www.npmjs.com/package/tweetnacl#naclsignkeypair
// Nacl Sign keypair uses ed25519 algorithm by default

let keyPair = nacl.sign.keyPair();
let { publicKey, secretKey } = keyPair;

let ED25519PublicKeyUint = publicKey
let ED25519PrivateKeyUint = secretKey //required for signature generation and is of the form Uint8

// let b64PublicKey = base64url.fromBase64(Buffer.from(publicKey).toString('base64'));  // Base 64 encoded Public key with url safe flag
// let b64PrivateKey = base64url.fromBase64(Buffer.from(secretKey).toString('base64')); // Base 64 encoded Private key with url safe flag
let b64PublicKey = Buffer.from(publicKey).toString('base64');
let b64PrivateKey = Buffer.from(secretKey.slice(0,32)).toString('base64');
let hexEncodedPublicKey = Buffer.from(publicKey).toString("hex");
let hexEncodedPrivateKey = Buffer.from(secretKey.slice(0,32)).toString("hex");
let biscuitPrivateKey = hexEncodedPrivateKey;

console.log('Base64 Public Key: ', b64PublicKey, b64PublicKey.length);
console.log('Base64 Private Key: ', b64PrivateKey, b64PrivateKey.length);

// if(secretKey.length === publicKey.length) {
//     let temporaryPrivateKey = new Uint8Array(secretKey.length + publicKey.length);

//     for(let idx = 0; idx < secretKey.length; idx++) {
//         temporaryPrivateKey[idx] = secretKey[idx];
//     }

//     for(let idx = 0; idx < publicKey.length; idx++) {
//         temporaryPrivateKey[secretKey.length + idx] = publicKey[idx];
//     }

//     secretKey = temporaryPrivateKey;
// }

// ED25519PrivateKeyUint = secretKey;


export {
    ED25519PublicKeyUint,
    ED25519PrivateKeyUint,
    b64PublicKey,
    b64PrivateKey,
    hexEncodedPublicKey,
    hexEncodedPrivateKey,
    biscuitPrivateKey,
}




