import { SpaceAndTime } from "../src/index.js";

const userId: string = "SOME_RANDOM_USERID";
const sessionFilePath: string = "session.json";
const credentialsFilePath: string = "credentials.json";
const resourceName: string = "ETHEREUM.TRANSACTIONS";
var sessionObj: any = {};
var keypair: any = {};

// Instantiate SXT
const sxt = new SpaceAndTime();

/**
 * Check existing session
 */
const CheckExistingSession = async (
    sessionFilePath: string,
    sxt: any
): Promise<boolean> => {
    const storage = sxt.Storage();
    if (storage.ReadSession(sessionFilePath)?.error) {
        return false;
    }

    const accessTokenObj = sxt.Authentication();
    const validateResponse = await accessTokenObj.ValidateToken();
    if (typeof validateResponse.error !== "undefined") {
        return false;
    }

    const credentialsJson = storage.ReadCredentials(credentialsFilePath).data;
    const authorization = sxt.Authorization();

    const credentials =
        authorization.GenerateKeyPairFromString(credentialsJson);

    keypair = credentials;

    return true;
};

/**
 * Example
 * Authentication process
 */
const AuthUtil = async (userId: string, sxt: any): Promise<any> => {
    try {
        const authentication = sxt.Authentication();
        const authorization = sxt.Authorization();

        // Check user
        const userExists = await authentication.CheckUser(userId);

        if (!userExists.data) {
            // Generate new key pair
            const keyPair = await authorization.GenerateKeyPair();
            keypair = keyPair;
        } else {
            console.error(
                "The user exists but you have misplaced the session.json and credentials.json files. Please create them in the root folder of the sdk. Example can be found here https://github.com/spaceandtimelabs/SxT-NodeJS-SDK/tree/main/examples"
            );
            return undefined;
        }

        // Auth code
        const authCode = await authentication.GenerateAuthCode(userId);
        console.log("Auth Code", authCode.data, keypair);

        if (typeof authCode.data === "undefined") {
            console.log(authCode);
            return undefined;
        }

        // Sign message
        const sign = await authorization.GenerateSignature(
            authCode.data.authCode,
            keypair.privateKey_64
        );
        console.log("Signature", sign.signature);

        // Get access token
        const accessToken = await authentication.GenerateToken(
            userId,
            authCode.data.authCode,
            sign.signature,
            keypair.publicKeyB64_32
        );
        console.log("Access Token", accessToken);
        return accessToken.data;
    } catch (e) {
        console.log("ERR", e);
        return undefined;
    }
};

/**
 * Example
 * Discovery APIs
 */

const DiscoveryUtil = async (sxt: any): Promise<boolean> => {
    const discovery = sxt.DiscoveryAPI();

    // List schemas
    const schemas = await discovery.ListSchemas();
    console.log(schemas);

    // // List tables
    const tables = await discovery.ListTables("PUBLIC", "ETHEREUM");

    // List table columns
    const columns = await discovery.ListColumns("ETHEREUM", "TRANSACTIONS");

    // List table indexes
    const indexes = await discovery.ListTableIndexes(
        "ETHEREUM",
        "TRANSACTIONS"
    );

    if (schemas?.error || tables?.error || columns?.error || indexes?.error) {
        return false;
    }
    return true;
};

/**
 * Example
 * SQL Core APIs
 */

const SQLAPIUtil = async (sxt: any, keypair: any): Promise<boolean> => {
    // Create Biscuits
    const requiredBiscuit = [
        {
            operation: "ddl_create",
            resource: resourceName,
        },
        {
            operation: "ddl_drop",
            resource: resourceName,
        },
        {
            operation: "ddl_alter",
            resource: resourceName,
        },
        {
            operation: "dml_insert",
            resource: resourceName,
        },
        {
            operation: "dml_delete",
            resource: resourceName,
        },
        {
            operation: "dml_update",
            resource: resourceName,
        },
        {
            operation: "dql_select",
            resource: resourceName,
        },
    ];

    const authorization = sxt.Authorization();
    const biscuit = await authorization.CreateBiscuitToken(
        requiredBiscuit,
        keypair.biscuitPrivateKeyHex_32
    );

    const credentialsString = {
        userid: userId,
        privateKeyB64_64: keypair.privateKeyB64_64,
        publicKeyB64_32: keypair.publicKeyB64_32,
        resource: resourceName,
        biscuit: biscuit.data[0],
        biscuitPrivateKeyHex_32: keypair.biscuitPrivateKeyHex_32,
        biscuitPublicKeyHex_32: keypair.biscuitPublicKeyHex_32,
    };

    const storage = sxt.Storage();
    storage.WriteCredentials(
        JSON.stringify(credentialsString),
        credentialsFilePath
    );

    const sqlAPI = sxt.SqlAPI();

    let biscuitArray = [biscuit.data[0]];
    let resourceArray = [resourceName];

    // SQL operations
    // Create
    const createTable = await sqlAPI.DDL(
        `CREATE TABLE ${resourceName}  (id INT PRIMARY KEY, test VARCHAR) WITH "public_key=${keypair.biscuitPublicKeyHex_32},access_type=public_append"`,
        biscuitArray
    );
    // console.log("CREATE TABLE", createTable);

    // Insert
    const insertData = await sqlAPI.DML(
        `INSERT INTO ${resourceName} VALUES (5, 'x5')`,
        biscuitArray,
        resourceArray
    );
    // console.log("INSERT DATA", insertData);

    // READ
    const readData = await sqlAPI.DQL(
        `SELECT * FROM ${resourceName}`,
        biscuitArray,
        resourceArray
    );
    // console.log("READ DATA", readData);

    // Drop table after test
    const dropTable = await sqlAPI.DDL(
        `DROP TABLE ${resourceName}`,
        biscuitArray
    );
    // console.log("DROP TABLE", dropTable);
    if (
        createTable?.error ||
        insertData?.error ||
        readData?.error ||
        dropTable?.error
    ) {
        return false;
    }
    return true;
};

/**
 * Function calls
 */

// Existing session or new Authentication
const validExistingSession = await CheckExistingSession(sessionFilePath, sxt);

if (!validExistingSession) {
    // create a new account/ or fetch user credentials
    sessionObj = await AuthUtil(userId, sxt);
    if (typeof sessionObj === "undefined") {
        console.error("Invalid session");
    } else {
        if (sessionObj?.error) {
            console.error("Invalid session");
        } else {
            const storage = sxt.Storage();
            storage.WriteSession(JSON.stringify(sessionObj), sessionFilePath);

            await DiscoveryUtil(sxt);
            await SQLAPIUtil(sxt, keypair);
        }
    }
} else {
    const storage = sxt.Storage();
    sessionObj = storage.ReadSession(sessionFilePath);
    storage.ReadCredentials(credentialsFilePath);

    await DiscoveryUtil(sxt);
    await SQLAPIUtil(sxt, keypair);
}
