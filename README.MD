
## javascript-sxt-sdk (v.0.0.2)

JavaScript(NodeJS) SDK for Space and Time Gateway (javascript version >= 19.8.0)

## Installation Instructions

_Note: Before running the code, rename `.env.sample` to `.env` and ensure that your credentials are setup in the `.env` file properly_

```sh
npm install
```

The code in ``examples.js`` demonstrates how to call the SDK

To run your code, use the command ``node --experimental-wasm-modules filename.js``

_Note: The ``--experimental-wasm-modules`` flag is required as Web Assembly is used in some parts of the codebase 
       which requires this flag to run the code._

## Features

- **Sessions**
The SDK implements persistent storage in 
	1. _File based sessions_

- **Encryption**
It supports ED25519 Public key encryption for Biscuit Authorization and securing data in the platform.

-  **SQL Support**
	- Support for DDL : ```creating own schema(namespace), tables, altering and deleting tables```
	- Support for DML: ```CRUD``` operation support.
	- Support for SQL: ```select``` operations support.
	- Support for SQL Views

- **Platform Discovery**
 For fetching metadata and information about the database resources.
	 - Schemas
	 - Tables
	 - Table Columns
	 - Table Indexes
	 - Table Primary Keys
	 - Table Relationships
	 - Table Primary Key References
	 - Table Foreign Key References

- **Platform Blockchain**
 For fetching blockchain metadata and information
	- Blockchains
	- Blockchain Schemas
	- Blockchain Information


## Examples

 - **Initializing the SDK**
```js
	// Initializing the Space and Time SDK for use.
	import SpaceAndTimeSDK from "./SpaceAndTimeSDK.js";
	const initSDK = SpaceAndTimeSDK.init();
```

- **Authenticating with the Space and Time Platform**

Make sure to save your **private key** used in authentication and biscuit generation or else you will not be able to have access to the user and the tables created using the key.

The generated ``AccessToken`` is valid for 25 minutes and the ``RefreshToken`` for 30 minutes.

```js
	// Authenticate yourself using the Space and Time SDK.
	let [tokenResponse, tokenError] =  await initSDK.AuthenticateUser();

	console.log(tokenResponse, tokenError);
```
- **Generating Biscuits**

You can create multiple biscuit tokens for a table allowing you to provide different access levels for users. For the list of all capabilities, refer our [documentation](https://docs.spaceandtime.io/docs/biscuit-authorization).

Sample biscuit generation with permissions for `select query`,`insert query`, `update query`, `delete query`, `create table`.

	**Note**:
	
	Specifying True in the function will give you a wildcard biscuit with all of the permissions.

```js
	let [ biscuitArrayResponse, biscuitArrayError ] = initSDK.generateBiscuits(biscuitPrivateKey, ["ETHEREUM.CONTRACTS", "ETHEREUM.TRANSACTIONS"], false, ["SELECT", "INSERT", "UPDATE", "DELETE"]);
	
	console.log('Response: ', biscuitArrayResponse);
	console.log('Error: ', biscuitArrayError);
```

- **DDL, DML and DQL**

	**Note**: 

	To create a new **schema**, ``ddl_create`` permission is needed.

```js
	// Create a Schema
	let [createSchemaResponse, createSchemaError] =  await initSDK.CreateSchema("CREATE SCHEMA ETH");

	console.log('Response: ', createSchemaResponse)
	console.log('Error: ', createSchemaError)

	// Only for Create Table Queries
	// for DROP, use DDL()
	let [CreateTableResponse, CreateTableError] =  await initSDK.CreateTable("CREATE TABLE ETH.TESTTABLE(id INT PRIMARY KEY, test VARCHAR)", "permissioned", publickey, biscuitArray);

	console.log('Response: ', CreateTableResponse)
	console.log('Error: ', CreateTableError)

	// For DROP
	let [DDLresponse, DDLerror] =  await initSDK.DDL("DROP TABLE ETH.TESTTABLE", biscuitArray);

	console.log('Response: ', DDLresponse)
	console.log('Error: ', DDLerror)

	// DML 
	// Use DML() to insert, update, delete and merge queries
	let [DMLResponse, DMLError] =  await initSDK.DML(["ETH.TESTTABLE"], "INSERT INTO ETH.TESTTABLE VALUES(5, 'X5')", biscuitArray);

	console.log('Response: ', DMLResponse)
	console.log('Error: ', DMLError)

	// DQL for selecting content from the blockchain tables.
	let [DQLResponse, DQLError] =  await initSDK.DQL(["ETH.TESTTABLE"], "SELECT * FROM ETH.TESTTABLE", biscuitArray);

	console.log('Response: ', DQLResponse)
	console.log('Error: ', DQLError)
```

- **DISCOVERY**

	Discovery SDK calls need a user to be logged in.

```js
	// List Schemas
	let [getSchemaResponse, getSchemaError] =  await initSDK.getSchemas();

	console.log('Response: ', getSchemaResponse)
	console.log('Error: ', getSchemaError)

	// List Tables in a given schema
	// Possible scope values - ALL = all tables, PUBLIC = non-permissioned tables, PRIVATE = tables created by a requesting user
	let [getTableResponse, getTableError] =  await initSDK.getTables("ALL","ETH");

	console.log('Response: ', getTableResponse)
	console.log('Error: ', getTableError)

	// List columns for a given table in a schema
	let [getTableColumnResponse, getTableColumnError] =  await initSDK.getTableColumns("ETH","TESTTABLE");

	console.log('Response: ', getTableColumnResponse)
	console.log('Error: ', getTableColumnError)

	// List table index for a given table in a schema
	let [getTableIndexesResponse, getTableIndexesError] =  await initSDK.getTableIndexes("ETH","TESTTABLE");

	console.log('Response: ', getTableIndexesResponse)
	console.log('Error: ', getTableIndexesError)

	// List table primary key for a given table in a schema
	let [getPrimaryKeyResponse, getPrimaryKeyError] =  await initSDK.getPrimaryKeys("ETH", "TESTTABLE");

	console.log('Response: ', getPrimaryKeyResponse)
	console.log('Error: ', getPrimaryKeyError)

	// List table relations for a schema and scope
	let [tableRelationshipResponse, tableRelationshipError] =  await initSDK.getTableRelationships("ETH", "PRIVATE");

	console.log('Response: ', tableRelationshipResponse)
	console.log('Error: ', tableRelationshipError)

	// List table primary key references for a table, column and a schema
	let [primaryKeyReferenceResponse, primaryKeyReferenceError] =  await initSDK.getPrimaryKeyReferences("ETH", "TESTTABLE", "TEST");

	console.log('Response: ', primaryKeyReferenceResponse)
	console.log('Error: ', primaryKeyReferenceError)

	// List table foreign key references for a table, column and a schema
	let [foreignKeyReferenceResponse, foreignKeyReferenceError] =  await initSDK.getForeignKeyReferences("ETH", "TESTTABLE", "TEST");

	console.log('Response: ', foreignKeyReferenceResponse)
	console.log('Error: ', foreignKeyReferenceError)
```

- **Blockchain**

	For retrieving platform specific blockchain information and metadata
	
```js

	// Get the blockchains supported by the platform
	let [ getBlockchainResponse, getBlockchainError ] = await initSDK.getBlockchains();

	console.log('Response: ', getBlockchainResponse)
	console.log('Error: ', getBlockchainError)

	// Get schemas for the provided blockchain
	let [ getBlockchainSchemasResponse, getBlockchainSchemasError ] = await initSDK.getBlockchainSchemas("ETHEREUM");

	console.log('Response: ', getBlockchainSchemasResponse);
	console.log('Error: ', getBlockchainSchemasError);

	// Get Metadata Information for the provided blockchain
	let [ getBlockchainInformationResponse, getBlockchainInformationError ] = await initSDK.getBlockchainInformation("ETHEREUM");

	console.log('Response: ', getBlockchainInformationResponse);
	console.log('Error: ', getBlockchainInformationError);

```

-   **Storage**

    For File Storage, the following methods are available
    
```js

    // File
    SpaceAndTimeInit.write_to_file(AccessToken, RefreshToken, AccessTokenExpires, RefreshTokenExpires)
   
    SpaceAndTimeInit.read_file_contents()
```
