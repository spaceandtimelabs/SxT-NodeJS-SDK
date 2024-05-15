import * as dotenv from "dotenv";
import { GetAccessToken } from "../helpers/accesstoken.js";
import { QueryHelper } from "../helpers/queryhelper.js";
dotenv.config();
export default class DiscoveryAPI {
    constructor() {
        this.PossibleScopes = [
            "PRIVATE",
            "SUBSCRIPTION",
            "PUBLIC",
            "ALL",
        ];
        this.PossibleSchemaTypes = ["core", "sxt", "community"];
        // List schemas
        this.ListSchemas = async (scope, searchPattern) => {
            let endpoint = "/v2/discover/schema?";
            if (typeof scope !== "undefined") {
                if (this.PossibleScopes.includes(scope)) {
                    endpoint = `${endpoint}scope=${scope}`;
                }
                else {
                    return {
                        error: new Error("Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"),
                    };
                }
            }
            if (typeof searchPattern !== "undefined") {
                endpoint = `&${endpoint}searchPattern=${searchPattern}`;
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List tables
        this.ListTables = async (scope, schema, searchPattern) => {
            let endpoint = "/v2/discover/table?";
            if (!this.PossibleScopes.includes(scope)) {
                return {
                    error: new Error("Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"),
                };
            }
            endpoint = `${endpoint}scope=${scope}&schema=${schema}`;
            if (typeof searchPattern !== "undefined") {
                endpoint = `&${endpoint}searchPattern=${searchPattern}`;
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List columns in table
        this.ListColumns = async (schema, table) => {
            const endpoint = `/v2/discover/table/column?schema=${schema}&table=${table}`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List table indexes
        this.ListTableIndexes = async (schema, table) => {
            const endpoint = `/v2/discover/table/index?schema=${schema}&table=${table}`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List table primary key
        this.ListTablePrimaryKey = async (schema, table) => {
            const endpoint = `/v2/discover/table/primarykey?schema=${schema}&table=${table}`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List table relations
        this.ListTableRelations = async (schema, scope) => {
            if (!this.PossibleScopes.includes(scope)) {
                return {
                    error: new Error("Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"),
                };
            }
            const endpoint = `/v2/discover/table/relations?schema=${schema}&scope=${scope}`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List primary key references in a table
        this.ListPrimaryKeyRefs = async (schema, table, column) => {
            let endpoint = `/v2/discover/refs/primarykey?schema=${schema}&table=${table}`;
            if (typeof column !== "undefined") {
                endpoint = `${endpoint}&column=${column}`;
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List foreign key references in a table
        this.ListForeignKeyRefs = async (schema, table, column) => {
            let endpoint = `/v2/discover/refs/foreignkey?schema=${schema}&table=${table}`;
            if (typeof column !== "undefined") {
                endpoint = `${endpoint}&column=${column}`;
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List views
        this.ListViews = async (scope, schema, searchPattern) => {
            if (!this.PossibleScopes.includes(scope)) {
                return {
                    error: new Error("Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"),
                };
            }
            let endpoint = `/v2/discover/view?scope=${scope}`;
            if (typeof schema !== "undefined") {
                endpoint = `${endpoint}&schema=${schema}`;
            }
            if (typeof searchPattern !== "undefined") {
                endpoint = `${endpoint}&searchPattern=${searchPattern}`;
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List Blockchains
        this.ListBlockchains = async () => {
            const endpoint = `/v2/discover/blockchains`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List Blockchain schemas
        this.ListBlockchainSchemas = async (chainId, schemaType) => {
            let endpoint = `/v2/discover/blockchains/${chainId}/schemas`;
            if (typeof schemaType !== "undefined") {
                if (this.PossibleSchemaTypes.includes(schemaType)) {
                    endpoint = `${endpoint}?schemaType=${schemaType}`;
                }
                else {
                    return {
                        error: new Error("Possible schema type values are `sxt`, `community`, `core`"),
                    };
                }
            }
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // List Blockchain information
        this.ListBlockchainInformation = async (chainId) => {
            let endpoint = `/v2/discover/blockchains/${chainId}/meta`;
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
    }
}
