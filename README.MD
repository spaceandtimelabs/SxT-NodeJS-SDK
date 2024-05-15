## javascript-sxt-sdk (v.2.0.6)

JavaScript(NodeJS) SDK for Space and Time Gateway (javascript version >= 19.8.0)

## Installation Instructions

_Note: Before running the code, rename `.env.sample` to `.env` and ensure that your credentials are setup in the `.env` file properly_

```sh
npm install
```

The code in `examples/index.ts` demonstrates how to call the SDK

To run your code, use the command, configure the **package.json** like this

```js
"scripts": {
        "build": "node --experimental-wasm-modules <YOUR_PROJECT_ENTRY_POINT.js>",
    }

```

_Note: The `--experimental-wasm-modules` flag is required as Web Assembly is used in some parts of the codebase
which requires this flag to run the code._

## Features

-   **Sessions**
    The SDK implements persistent storage in 1. _File based sessions_

-   **Encryption**
    It supports ED25519 Public key encryption for Biscuit Authorization and securing data in the platform.

-   **SQL Support**

    -   Support for DDL : `creating own schema(namespace), tables, altering and deleting tables`
    -   Support for DML: `CRUD` operation support.
    -   Support for SQL: `select` operations support.
    -   Support for SQL Views

-   **Platform Discovery**
    For fetching metadata and information about the database resources.

    -   Schemas
    -   Tables
    -   Table Columns
    -   Table Indexes
    -   Table Primary Keys
    -   Table Relationships
    -   Table Primary Key References
    -   Table Foreign Key References

-   **Platform Blockchain**
    For fetching blockchain metadata and information
    -   Blockchains
    -   Blockchain Schemas
    -   Blockchain Information

## Examples

-   **Initializing the SDK**

```js
// Initializing the Space and Time SDK for use.
import { SpaceAndTime } from "sxt-nodejs-sdk";
```

-   **Authenticating with the Space and Time Platform**

Make sure to save your **private key** used in authentication and biscuit generation or else you will not be able to have access to the user and the tables created using the key.

The generated `AccessToken` is valid for 25 minutes and the `RefreshToken` for 30 minutes.

```js
// Authenticate yourself using the Space and Time SDK.
// Auth code
const authentication = sxt.Authentication();

const authCode = await authentication.GenerateAuthCode(userId);
// console.log("Auth Code", authCode.data.authCode);

// Check user
const userExists = await authentication.CheckUser(userId);

const authorization = sxt.Authorization();
if (!userExists.data) {
    // Generate new key pair
    const keyPair = await authorization.GenerateKeyPair();
    keypair = keyPair;
}

// Sign message
const sign = await authorization.GenerateSignature(
    new TextEncoder().encode(authCode.data.authCode),
    keypair.privateKey_64
);
// console.log("Signature", sign.signature);

// Get access token
const accessToken = await authentication.GenerateToken(
    userId,
    authCode.data.authCode,
    sign.signature,
    keypair.publicKeyB64_32
);
// console.log("Access Token", accessToken);
return accessToken.data;

console.log(tokenResponse, tokenError);
```

-   **Generating Biscuits, DDL, DML and DQL**

You can create multiple biscuit tokens for a table allowing you to provide different access levels for users. For the list of all capabilities, refer our [documentation](https://docs.spaceandtime.io/docs/biscuit-authorization).

Sample biscuit generation with permissions for `select query`,`insert query`, `update query`, `delete query`, `create table`.

```js
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
```

#### Note:

To create a new **schema**, `ddl_create` permission is needed.

```js
// Create a Schema
const createTable = await sqlAPI.DDL(
    `CREATE TABLE ${resourceName}  (id INT PRIMARY KEY, test VARCHAR)`,
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
const dropTable = await sqlAPI.DDL(`DROP TABLE ${resourceName}`, biscuitArray);
// console.log("DROP TABLE", dropTable);
```

-   **DISCOVERY**

    Discovery SDK calls need a user to be logged in.

```js
const discovery = sxt.DiscoveryAPI();

// List schemas
const schemas = await discovery.ListSchemas();
console.log(schemas);

// // List tables
const tables = await discovery.ListTables("PUBLIC", "ETHEREUM");

// List table columns
const columns = await discovery.ListColumns("ETHEREUM", "TRANSACTIONS");

// List table indexes
const indexes = await discovery.ListTableIndexes("ETHEREUM", "TRANSACTIONS");
```
