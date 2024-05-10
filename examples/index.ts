import { SpaceAndTime } from "../src/index.js";

const userId = "test-prod-27";
const sxt = new SpaceAndTime();

/**
 * Example
 * Authentication process
 */
const AuthUtil = async (userId: string, sxt: any) => {
    // Auth code
    const authentication = sxt.Authentication();
    const authCode = await authentication.GenerateAuthCode(userId);
    // console.log("Auth Code", authCode.data.authCode);

    // Generate Key pair
    const authorization = sxt.Authorization();
    const keyPair = await authorization.GenerateKeyPair();
    // console.log("Key pair", keyPair);

    // Sign message
    const sign = await authorization.GenerateSignature(
        new TextEncoder().encode(authCode.data.authCode),
        keyPair.privateKey
    );
    // console.log("Signature", sign.signature);

    // Get access token
    const accessToken = await authentication.GenerateToken(
        userId,
        authCode.data.authCode,
        sign.signature,
        keyPair.publicKeyB64
    );
    console.log("Access Token", accessToken);
};

/**
 * Example
 * Discovery APIs
 */

const DiscoveryUtil = async (sxt: any) => {
    const discovery = sxt.DiscoveryAPI();

    // List schemas
    const schemas = await discovery.ListSchemas();
    console.log(schemas);

    // // List tables
    await discovery.ListTables("PUBLIC", "ETHEREUM");

    // List table columns
    await discovery.ListColumns("ETHEREUM", "TRANSACTIONS");

    // List table indexes
    await discovery.ListTableIndexes("ETHEREUM", "TRANSACTIONS");
};

/**
 * Example
 * SQL Core APIs
 */

const SQLAPIUtil = async (sxt: any) => {
    const sqlAPI = sxt.SqlAPI();
    console.log(sqlAPI);
};

// Call all functions
await AuthUtil(userId, sxt);
await DiscoveryUtil(sxt);
await SQLAPIUtil(sxt);
