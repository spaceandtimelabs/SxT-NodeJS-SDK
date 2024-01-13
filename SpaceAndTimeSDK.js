import * as dotenv from 'dotenv' 
dotenv.config();

import axios from 'axios';
import nacl from "tweetnacl";
import fs, { access, write } from 'fs';
import os from 'os';
import { ED25519PublicKeyUint, ED25519PrivateKeyUint, b64PrivateKey, b64PublicKey, hexEncodedPrivateKey, hexEncodedPublicKey, biscuitPrivateKey } from "./utils/keygen.js";
import { biscuit, block, authorizer, Biscuit, KeyPair, Fact, PrivateKey, BiscuitBuilder } from '@biscuit-auth/biscuit-wasm';
import Utils from './utils/utils-functions.js';
import SQLOperation from './BiscuitConstants.js';	
import cron from 'node-cron'

export default class SpaceAndTimeSDK {
    constructor() {
        this.baseUrl = process.env.BASEURL;
    } 

    static init() {
        return new SpaceAndTimeSDK();
    }

    // Checks if User ID is in use.
    async checkUserId(userId) {
       try {
        Utils.checkUserIdFormat(userId);
        const response = await axios.get(`${this.baseUrl}/auth/idexists/${userId}`);
        return [ response.data, null ];
    }
       catch(error) {
        return [ null, error.message ];
       }
    }

    async checkUserIdExistance(userId) {

        let [ userIdResponse, userIdError ] = await this.checkUserId(userId);
        if(userIdError) throw new Error(userIdError);

        return userIdResponse;
    }

    // Generates an AuthCode given an userId, prefix and joinCode
    #generateAuthCode = async function (userId, prefix, joinCode) { 
        try {
            Utils.checkUserIdFormat(userId);
            Utils.checkPrefixAndJoinCode(prefix,joinCode);

            const payload = {
                userId: userId,
                prefix: prefix,
                joinCode: joinCode,
            };

            const response = await axios.post(`${this.baseUrl}/auth/code`, payload);
            return [ response.data.authCode, null ];
            
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    //Generate a signature with the given authCode and privateKey
    generateSignature = (message, privateKey) => {
        Utils.checkStringFormat(message);

        let authCode = new TextEncoder().encode(message); 
        
        // The NACL Binding for signature generation uses "only" ED25519 
        let signatureArray = nacl.sign(authCode, privateKey);
        let signature = Buffer.from(signatureArray.buffer, signatureArray.byteOffset, signatureArray.byteLength).toString('hex');
        signature = signature.slice(0,128);

        return signature;
    }

    // Private function used to generate the Access and Refresh tokens
    #generateToken = async function (userId, authCode, signature, publicKey, scheme="ed25519") {
        try {
            Utils.checkUserIdFormat(userId);
            Utils.checkStringFormat(authCode)
            Utils.checkSignature(signature) //Checking if signature is hex encoded 
            Utils.isBase64(publicKey)

            const payload = {
                userId: userId,
                authCode: authCode,
                signature: signature,
                key: publicKey,
                scheme: scheme
            }
    
            const response = await axios.post(`${this.baseUrl}/auth/token`, payload);
            return [ response.data, null ];
        } 
        catch(error) {
            return [ null, error ];
        }
    }

    async AuthenticateUser(privateKeyArg = "", publicKeyArg = "") {

        let userId = process.env.USERID;

        let mainPublicKey = (publicKeyArg === "") ? b64PublicKey : publicKeyArg;
        let mainPrivateKey = (privateKeyArg === "") ? b64PrivateKey : privateKeyArg;
        
        let publicKey = (process.env.PUBLICKEY === undefined) ? mainPublicKey : process.env.PUBLICKEY;
        let privateKey = (process.env.PRIVATEKEY === undefined) ? mainPrivateKey : process.env.PRIVATEKEY;
        
        let userIdStatus = await this.checkUserIdExistance(userId);
        if(userIdStatus === false)
        {
            return this.Authenticate(privateKey, publicKey);
        }
        else
        {
            return this.Authenticate(privateKey, publicKey);
        }

    }

    // Generates out Access and Refresh Tokens 
    async Authenticate(privateKey, publicKey, prefix = "") {

        let userId = process.env.USERID, joinCode = process.env.JOINCODE, scheme = process.env.SCHEME;

        let [ authCodeResponse, authCodeError ] = await this.#generateAuthCode(userId, prefix, joinCode);
        if(authCodeError) throw new Error(authCodeError);
        let privateKeyUint = this.base64ToUint8(privateKey, publicKey);

        let signature = this.generateSignature(authCodeResponse, privateKeyUint);
        
        let [ tokenResponse, tokenError ] = await this.#generateToken(userId, authCodeResponse, signature, publicKey, scheme);
        if(tokenError) throw new Error(tokenError);

        let accessToken = tokenResponse.accessToken, refreshToken = tokenResponse.refreshToken;
        let accessTokenExpires = tokenResponse.accessTokenExpires, refreshTokenExpires = tokenResponse.refreshTokenExpires

        this.writeToFile(accessToken, refreshToken, accessTokenExpires, refreshTokenExpires)

        // Writing values of Public and Private key to ENV.
        this.setEnvValue("PUBLICKEY", publicKey);
        this.setEnvValue("PRIVATEKEY", privateKey);

        cron.schedule(`*/25 * * * *`, async () => {
            await this.refreshToken();
        })

        return [ tokenResponse, tokenError ];   
    }

    // Allows the user to generate new tokens if time left is less than or equal to 2 minutes OR gives them back their unexpired tokens.
    async rotateTokens() {
        
        const MINIMUM_TOKEN_SECONDS = 120;

        let tokens = this.retrieveFileContents();
        let accessToken = tokens.accessToken, refreshToken = tokens.refreshToken;
        let accessTokenExpires = tokens.accessTokenExpires, refreshTokenExpires = tokens.refreshTokenExpires;

        let authenticationTokens = [ accessToken, refreshToken ];
        
        const currentTimeMilliseconds = Date.now(); //Current EPOCH time in milliseconds

        const accessTokenExpiryDateTime = new Date(currentTimeMilliseconds + accessTokenExpires);
        const refreshTokenExpireDateTime = new Date(currentTimeMilliseconds + refreshTokenExpires);

        let accessTokenExpiryDuration = (Math.round((accessTokenExpiryDateTime - new Date()) / 1000));
        let refreshTokenExpiryDuration = (Math.round((refreshTokenExpireDateTime - new Date()) / 1000));

        let shouldRefreshToken = accessTokenExpiryDuration <= MINIMUM_TOKEN_SECONDS;
        let shouldAuthenticateUser = refreshTokenExpiryDuration <= MINIMUM_TOKEN_SECONDS;

        if(shouldRefreshToken) {
            if(shouldAuthenticateUser) {
                let [ tokenResponse, tokenError ] = await this.AuthenticateUser();
                return [ tokenResponse, tokenError ];
            }

            let [ refreshTokenResponse, refreshTokenError ] = await this.refreshToken();
            return [ refreshTokenResponse, refreshTokenError ];
        } 

        return [ authenticationTokens, null ];
    }

    base64ToUint8 = (base64PrivateKey, base64PublicKey) => {

        Utils.isBase64(base64PrivateKey);
        Utils.isBase64(base64PublicKey);
       
        let privateKeyBuffer = Buffer.from(base64PrivateKey, 'base64');
        let publicKeyBuffer = Buffer.from(base64PublicKey, 'base64');
    
        let privateKeyUint8 = new Uint8Array(privateKeyBuffer.buffer, privateKeyBuffer.byteOffset, privateKeyBuffer.byteLength);
        let publicKeyUint8 = new Uint8Array(publicKeyBuffer.buffer, publicKeyBuffer.byteOffset, publicKeyBuffer.byteLength);
       
        if(privateKeyUint8.length === publicKeyUint8.length) {
            let temporaryPrivateKey = [];
        
            for(let idx = 0; idx < privateKeyUint8.length; idx++) {
                temporaryPrivateKey[idx] = privateKeyUint8[idx];
            }
        
            for(let idx = 0; idx < publicKeyUint8.length; idx++) {
                temporaryPrivateKey[privateKeyUint8.length + idx] = publicKeyUint8[idx];
            }
        
            privateKeyUint8 = temporaryPrivateKey;
        }

        let PrivateKeyUint8Array = new Uint8Array(privateKeyUint8.length);
        for (let i = 0; i < privateKeyUint8.length; i++) {
            PrivateKeyUint8Array[i] = privateKeyUint8[i];
        }

        return PrivateKeyUint8Array;
      }

     setEnvValue = (key, value) => {
        const ENV_VARS = fs.readFileSync(".env", "utf8").split(os.EOL);
        let found = false;
      
        for (let i = 0; i < ENV_VARS.length; i++) {
          const line = ENV_VARS[i].trim();
          if (line.startsWith("#")) {
            // Skip commented lines
            continue;
          }
      
          const [lineKey, lineValue] = line.split("=");
          if (lineKey === key) {
            // Key found, update its value
            ENV_VARS[i] = `${key}=${JSON.stringify(value)}`;
            found = true;
            break;
          }
        }
      
        if (!found) {
          // Key not found, add it
          ENV_VARS.push(`${key}=${JSON.stringify(value)}`);
        }
      
        fs.writeFileSync(".env", ENV_VARS.join(os.EOL));
      }

    retrieveFileContents = () => {

        const fileContents = fs.readFileSync('session.txt','utf8');
        const fileLines = fileContents.split(/\r?\n/);
    
        let accessToken = fileLines[0];
        let refreshToken = fileLines[1];
        let accessTokenExpires = fileLines[2];
        let refreshTokenExpires = fileLines[3];

        return { accessToken: accessToken, refreshToken: refreshToken, accessTokenExpires: accessTokenExpires, refreshTokenExpires: refreshTokenExpires };

    }

    writeToFile = (accessToken, refreshToken, accessTokenExpires, refreshTokenExpires) => {
        const fileData = `${accessToken}\n${refreshToken}\n${accessTokenExpires}\n${refreshTokenExpires}\n`;
        fs.writeFile('session.txt', fileData, (err) => {
            if(err) throw new Error(err);
        })
    }

    // Validates if the given access token is valid and returns userId on success.
    async validateToken() {
        try {

            let tokens = this.retrieveFileContents();
            let tokenValue = tokens.accessToken;

            Utils.checkStringFormat(tokenValue);
            let bearerTokenValue = 'Bearer ' + tokenValue; 
            let config = {
                headers: {
                 Authorization : bearerTokenValue
                }  
            };   

            const response = await axios.get(`${this.baseUrl}/auth/validToken`, config);
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    // Generate a new AccessToken and RefreshToken from the provided `refreshToken`
    async refreshToken() {
        try {
            let tokens = this.retrieveFileContents();
            let refreshToken = tokens.refreshToken;

            Utils.checkStringFormat(refreshToken);
            let bearerTokenValue = 'Bearer ' + refreshToken;
            let config = {
                headers: {
                 Authorization : bearerTokenValue
                }  
            };    
            
            const response = await axios.post(`${this.baseUrl}/auth/refresh`, null, config);

            /* Writing new access and refresh token values to file */
            
            let accessToken = response.data.accessToken;
            refreshToken = response.data.refreshToken;
            let accessTokenExpires = response.data.accessTokenExpires, refreshTokenExpires = response.data.refreshTokenExpires;

            this.writeToFile(accessToken, refreshToken, accessTokenExpires, refreshTokenExpires)
            
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }

    }

    // Logout or end an authenticated session of a user using a given RefreshToken.
    async logout() {
        try {

            let tokens = this.retrieveFileContents();
            let refreshToken = tokens.refreshToken;

            Utils.checkStringFormat(refreshToken);
            let bearerTokenValue = 'Bearer ' + refreshToken;

            let config = {
                headers: {
                 Authorization : bearerTokenValue
                }  
            };    

            const response = await axios.post(`${this.baseUrl}/auth/logout`, null, config);
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    #updateUrlVersion = (apiUrl) => {
        const newVersion = "v2"
        const urlParts = apiUrl.split("/")
        urlParts[urlParts.length-1] = newVersion
        return urlParts.join("/");
    }

    /* Discovery APIs */

    // Fetch the schema metadata
    async getSchemas(scope="", schema="") {
        try {        
            let v2versionURL = this.#updateUrlVersion(this.baseUrl)
            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;
            let endpoint = null;

            if(scope == "" && schema == "") {
                endpoint = `${v2versionURL}/discover/schema`;
            }
            else if(scope != "" && schema == "") {
                endpoint = `${v2versionURL}/discover/schema?scope=${scope}`;
            }
            else {
                Utils.checkStringFormat(scope);
                Utils.checkStringFormat(schema);
    
                scope = scope.toUpperCase();
                schema = schema.toUpperCase();
                endpoint = `${v2versionURL}/discover/schema?scope=${scope}&searchPattern=${schema}`
            }

            Utils.checkApiVersion(endpoint);

            let accessTokenValue = `Bearer ${accessToken}`; 
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            }

            const response = await axios.get(endpoint, config);
            return [ response.data, null ];
        }
        catch(error)
        {
            return [ null, error.message ];
        }
    }

    // Fetch Table column metadata    
    async getTables(scope, schema, table="") {
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;
            let v2versionURL = this.#updateUrlVersion(this.baseUrl);
            let endpoint = null;
            
            Utils.checkStringFormat(scope);
            Utils.checkPostgresIdentifier(schema);

            scope = scope.toUpperCase();
            schema = schema.toUpperCase();
            
            if(table == "") {
                endpoint = `${v2versionURL}/discover/table?scope=${scope}&schema=${schema}`
            }
            else {
                table = table.toUpperCase();
                endpoint = `${v2versionURL}/discover/table?scope=${scope}&schema=${schema}&searchPattern=${table}`
            }

            Utils.checkApiVersion(endpoint);

            let accessTokenValue = `Bearer ${accessToken}`; 
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            }

            const response = await axios.get(endpoint, config);
            return [ response.data, null ];
        }
        catch(error)
        {
            return [null, error.message ];
        }
    }
 
    async #discoveryAPIRequest(schema, tableName, endpoint) {
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkPostgresIdentifier(schema);
            Utils.checkPostgresIdentifier(tableName);
            Utils.checkApiVersion(endpoint);
    
            schema = schema.toUpperCase();
            tableName = tableName.toUpperCase();
    
            let accessTokenValue = `Bearer ${accessToken}`; 
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            };
    
            const response = await axios.get(endpoint, config);
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    // Fetch Table column metadata
    async getTableColumns(schema, tableName) {
        let v2versionURL = this.#updateUrlVersion(this.baseUrl)
        let endpoint = `${v2versionURL}/discover/table/column?schema=${schema}&table=${tableName}`;
        return await this.#discoveryAPIRequest(schema, tableName, endpoint);
    }

    // Fetch tables index metadata
    async getTableIndexes(schema, tableName) {
        let v2versionURL = this.#updateUrlVersion(this.baseUrl)
        let endpoint = `${v2versionURL}/discover/table/index?schema=${schema}&table=${tableName}`
        return await this.#discoveryAPIRequest(schema, tableName, endpoint);
    }

    // Fetch table primary key metadata
    async getPrimaryKeys(schema, tableName) {
        let v2versionURL = this.#updateUrlVersion(this.baseUrl)
        let endpoint = `${v2versionURL}/discover/table/primaryKey?schema=${schema}&table=${tableName}`;
        return await this.#discoveryAPIRequest(schema, tableName, endpoint);
    }

    async #discoveryAPIReferencesRequest(schema, tableName, column, endpoint) {
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkPostgresIdentifier(schema);
            Utils.checkPostgresIdentifier(tableName);
            Utils.checkStringFormat(column);
            Utils.checkApiVersion(endpoint);

            schema = schema.toUpperCase();
            tableName = tableName.toUpperCase();
            column = column.toUpperCase();

            let accessTokenValue = `Bearer ${accessToken}`; 
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            }

            const response = await axios.get(endpoint, config);
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    // Fetch all primary keys referenced by a provided foreign key
    async getPrimaryKeyReferences(schema, tableName, column) {
        let v2versionURL = this.#updateUrlVersion(this.baseUrl);
        let endpoint = `${v2versionURL}/discover/refs/primarykey?schema=${schema}&table=${tableName}&column=${column}`;
        return await this.#discoveryAPIReferencesRequest(schema, tableName, column, endpoint);
    }

    // Fetch all foreign key referencing the provided primary key
    async getForeignKeyReferences(schema, tableName, column) {
        let v2versionURL = this.#updateUrlVersion(this.baseUrl)
        let endpoint = `${v2versionURL}/discover/refs/foreignkey?schema=${schema}&table=${tableName}&column=${column}`
        return await this.#discoveryAPIReferencesRequest(schema, tableName, column, endpoint);
    }

    // Fetch table relationship metadata for tables in a schema
    async getTableRelationships(schema, scope) {
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;
            let v2versionURL = this.#updateUrlVersion(this.baseUrl)

            Utils.checkPostgresIdentifier(schema);
            Utils.checkStringFormat(scope);

            schema = schema.toUpperCase();
            scope = scope.toUpperCase();    

            let accessTokenValue = `Bearer ${accessToken}`; 
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            }

            const response = await axios.get(`${v2versionURL}/discover/table/relations?scope=${scope}&schema=${schema}`, config);
            return [ response.data, null ];

        }
        catch(error)
        {
            return [ null, error.message ];
        }
    }    

    /* Blockchain APIs */

    async #blockchainDataAPIRequest(url, chainId="") {
        try {
            Utils.checkApiVersion(url);
            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            if (chainId !== "") {
                Utils.checkStringFormat(chainId);
            }

            let accessTokenValue = `Bearer ${accessToken}`;
            let config = {
                headers: {
                    Authorization: accessTokenValue
                }
            }

            let response = await axios.get(url, config);
            return [response.data, null];

        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    // Retrieve Space and Time supported Blockchains
    async getBlockchains() {

        let v2versionURL = this.#updateUrlVersion(this.baseUrl);
        let endpoint = `${v2versionURL}/discover/blockchains`;
        return await this.#blockchainDataAPIRequest(endpoint);

    }

    // Retrieve all the schemas for the provided blockchain (chainId)
    async getBlockchainSchemas(chainId) {

        let v2versionURL = this.#updateUrlVersion(this.baseUrl);
        let endpoint = `${v2versionURL}/discover/blockchains/${chainId}/schemas`;
        return await this.#blockchainDataAPIRequest(endpoint, chainId);

    }

    // Retrieve the metadata for the provided blockchain (chainId)
    async getBlockchainInformation(chainId) {

        let v2versionURL = this.#updateUrlVersion(this.baseUrl);
        let endpoint = `${v2versionURL}/discover/blockchains/${chainId}/meta`;
        return await this.#blockchainDataAPIRequest(endpoint, chainId);

    }

    /* Core SQL APIs */

    // Parses the error messages returned by the gateway appropriately
    #parseSQLErrorMessage = (error) => {
        if (error.toString().startsWith('Error')) {
          return [ null, error ];
        }
      
        let main_error_message = null;
        try {
          main_error_message = JSON.parse(JSON.stringify(error.response.data));
        } catch (error) {
          return [ null, error.message ];
        }
      
        let title = main_error_message["title"];
        let detail = main_error_message["detail"]
          .split("\n")
          .slice(0, 3)
          .join("\n")
          .replace(/(\S)\n(\S)/g, "$1 $2");
      
        return [null, title + " : " + detail + "\n" + error.message];
      }

    convertSQLText = (sqlText, publicKey, accessType) => {
        return sqlText + " WITH \"public_key=" + publicKey + ",access_type=" + accessType + "\""
    }

    // Generates Biscuits given the resourceID and Private Key which is hex encoded and length 64.
    generateBiscuits = (privateKey, resourceIds, wildCardRequired = false, operations = []) => {

        try {

            Utils.checkStringFormat(privateKey)
            Utils.checkArrayFormat(resourceIds)
            Utils.checkBooleanFormat(wildCardRequired)
            Utils.checkArrayFormat(operations);

            let biscuitTokens = [];
            let resourceIdsContainer = resourceIds.map(resourceId => resourceId.toLowerCase())

            if(wildCardRequired) {
                    for(let resourceId of resourceIdsContainer) {
                        let biscuitBuilder = biscuit``;
                        let wildcard = '*'

                        let biscuitBlock = block`sxt:capability(${wildcard},${resourceId})`
                        biscuitBuilder.merge(biscuitBlock)
                        
                        let wildCardBiscuitToken = biscuitBuilder.build(PrivateKey.fromString(privateKey)).toBase64();
                        biscuitTokens.push(wildCardBiscuitToken)
                    }
                }

            else {

                let biscuitOperations = {
                    "CREATE" : SQLOperation.CREATE.Value,
                    "ALTER" : SQLOperation.ALTER.Value,
                    "DROP": SQLOperation.DROP.Value,
                    "INSERT": SQLOperation.INSERT.Value,
                    "UPDATE": SQLOperation.UPDATE.Value,
                    "MERGE": SQLOperation.MERGE.Value,
                    "DELETE": SQLOperation.DELETE.Value,
                    "SELECT": SQLOperation.SELECT.Value
                }
                
                let sqlOperations = [];
                for(let operation of operations) {
                    sqlOperations.push(biscuitOperations[operation])
                }

                for(let resourceId of resourceIdsContainer) {
                    let biscuitBuilder = biscuit``;
                    for(let operation of sqlOperations) {
                        let biscuitBlock = block`sxt:capability(${operation}, ${resourceId})`
                        biscuitBuilder.merge(biscuitBlock)
                    }

                    let biscuitToken = biscuitBuilder.build(PrivateKey.fromString(privateKey)).toBase64()
                    biscuitTokens.push(biscuitToken)
                }
            }

            return [ biscuitTokens, null ];
        }
        catch(error) {
            return [ null, error];
        }
    }


    // Creating a Schema
    async CreateSchema(sqlText, biscuitTokens=[], originApp="") {
        try {
            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkStringFormat(sqlText);
            Utils.checkArrayFormat(biscuitTokens);
            sqlText = sqlText.toUpperCase();

            let payload = {
                biscuits: biscuitTokens,
                sqlText: sqlText
            }

            let accessTokenValue = 'Bearer ' + accessToken;
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                    originApp:originApp
                }
            }

            const response = await axios.post(`${this.baseUrl}/sql/ddl`, payload, config);
            return [ response.data, null ];
        }
        catch(error) {
            return [ null, error.message ];
        }
    }

    // DDL
    // Create a table with the given resourceId
    async CreateTable(sqlText, accessType, publicKey, biscuitTokens=[], originApp="") {

        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkStringFormat(sqlText);   
            Utils.checkStringFormat(accessType);

            sqlText = sqlText.toUpperCase();
            
            let createSQLText = this.convertSQLText(sqlText, publicKey, accessType);
 
            let payload = {
                biscuits: biscuitTokens,
                sqlText: createSQLText,
            }

            let accessTokenValue = 'Bearer ' + accessToken; 
            
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                    originApp: originApp
                }
            }
    
            const response = await axios.post(`${this.baseUrl}/sql/ddl`, payload, config);
            return [ response.data, null ];

        }
        catch(error){
            return [ null, error ];
        }
    }

    // Drop a table with the given resourceId
    async DDL(sqlText, biscuitTokens=[], originApp="") {
        try {
            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkStringFormat(sqlText);
            Utils.checkArrayFormat(biscuitTokens);

            let payload = {
                biscuits: biscuitTokens,
                sqlText: sqlText.toUpperCase(),
            }
        
            let accessTokenValue = 'Bearer ' + accessToken; 
               
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                    originApp: originApp
                }
            }
    
            const response = await axios.post(`${this.baseUrl}/sql/ddl`, payload, config);
            return [ response.data, null ];
        }
            
        catch(error) {
            return [ null, error.message ];
        }
    }

    // DML
    // Perform insert, update, merge and delete with the given resourceId 
    async DML(resources, sqlText, biscuitTokens=[], originApp="") {

        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkPostGresIdentifiers(resources);
            Utils.checkStringFormat(sqlText);
            Utils.checkArrayFormat(biscuitTokens);
            
            let payload = {
                biscuits: biscuitTokens,
                resources: resources,
                sqlText: sqlText
            }

            let accessTokenValue = 'Bearer ' + accessToken; 
               
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                    originApp: originApp
                }
            }
    
            const response = await axios.post(`${this.baseUrl}/sql/dml`, payload, config);
            return [ response.data, null ];

        }

        catch(error) {
            return this.#parseSQLErrorMessage(error);
        }
    }

    //DQL
    // Perform selection with the given resourceId and if rowCount is 0 then the query will fetch all of the data
    async DQL(resources, sqlText, biscuitTokens=[], originApp="", rowCount = 0) { 
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkPostGresIdentifiers(resources);
            Utils.checkStringFormat(sqlText);
            Utils.checkArrayFormat(biscuitTokens);

            let payload = {};
            if(rowCount > 0) {
                payload = {
                    biscuits: biscuitTokens,
                    resources:resources,
                    sqlText: sqlText,
                    rowCount: rowCount
                }
            }
            else {
                payload = {
                biscuits: biscuitTokens,
                resources: resources,
                sqlText: sqlText
               }
            }

            let accessTokenValue = 'Bearer ' + accessToken; 
           
            let config = {
                headers: {
                    Authorization: accessTokenValue,
                    originApp: originApp
                }
            }
            
            let response = await axios.post(`${this.baseUrl}/sql/dql`, payload, config);
            return [ response.data, null ];
        }
        catch(error) {
            return this.#parseSQLErrorMessage(error);
        }
    }

    // Execute a view
    async executeView(viewName, parametersRequest = {}) {
        try {

            let tokens = this.retrieveFileContents();
            let accessToken = tokens.accessToken;

            Utils.checkStringFormat(viewName);

            let paramEndPoint = "";
            let paramString = "";
            let apiEndPoint =`${this.baseUrl}/sql/views/${viewName}`

            if(Object.keys(parametersRequest).length > 0) {
                for(const { name,type } of parametersRequest) {
                    paramString += `${name}=${type}&`
                }

                paramString = paramString.slice(0, paramString.length - 1);
                paramEndPoint += `?params=${paramString}`;
            }

            apiEndPoint += paramEndPoint;
            let accessTokenValue = 'Bearer ' + accessToken; 

            let config = {
                headers: {
                    Authorization: accessTokenValue,
                }
            }

            const response = await axios.get(apiEndPoint, null, config)
            return [ response.data, null ];
        }
        catch(error){
            return [ null, error.message ];
        }
    }
}