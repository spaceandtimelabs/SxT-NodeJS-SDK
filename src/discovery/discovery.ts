import * as dotenv from "dotenv";

import * as Types from "../helpers/types.js";
import { GetAccessToken } from "../helpers/accesstoken.js";
import { QueryHelper } from "../helpers/queryhelper.js";

dotenv.config();

export default class DiscoveryAPI {
    private PossibleScopes: string[] = [
        "PRIVATE",
        "SUBSCRIPTION",
        "PUBLIC",
        "ALL",
    ];
    private PossibleSchemaTypes: string[] = ["core", "sxt", "community"];

    // List schemas
    ListSchemas = async (
        scope?: string,
        searchPattern?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = "/v2/discover/schema";
        if (scope !== "" || searchPattern !== "") {
            endpoint = `${endpoint}?`;
        }

        if (scope !== "" && this.PossibleScopes.includes(scope)) {
            endpoint = `${endpoint}scope=${scope}`;
        } else {
            return {
                error: new Error(
                    "Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"
                ),
            };
        }

        if (searchPattern !== "") {
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
    ListTables = async (
        scope: string,
        schema: string,
        searchPattern?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = "/v2/discover/table?";

        if (!this.PossibleScopes.includes(scope)) {
            return {
                error: new Error(
                    "Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"
                ),
            };
        }

        endpoint = `${endpoint}scope=${scope}&${endpoint}schema=${schema}`;

        if (searchPattern !== "") {
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
    ListColumns = async (
        schema: string,
        table: string
    ): Promise<Types.APIResponse> => {
        const endpoint: string = `/v2/discover/table/column?schema=${schema}&table=${table}`;

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
    ListTableIndexes = async (
        schema: string,
        table: string
    ): Promise<Types.APIResponse> => {
        const endpoint: string = `/v2/discover/table/index?schema=${schema}&table=${table}`;

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
    ListTablePrimaryKey = async (
        schema: string,
        table: string
    ): Promise<Types.APIResponse> => {
        const endpoint: string = `/v2/discover/table/primarykey?schema=${schema}&table=${table}`;

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
    ListTableRelations = async (
        schema: string,
        scope: string
    ): Promise<Types.APIResponse> => {
        if (!this.PossibleScopes.includes(scope)) {
            return {
                error: new Error(
                    "Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"
                ),
            };
        }

        const endpoint: string = `/v2/discover/table/relations?schema=${schema}&scope=${scope}`;

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
    ListPrimaryKeyRefs = async (
        schema: string,
        table: string,
        column?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = `/v2/discover/refs/primarykey?schema=${schema}&table=${table}`;

        if (column !== "") {
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
    ListForeignKeyRefs = async (
        schema: string,
        table: string,
        column?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = `/v2/discover/refs/foreignkey?schema=${schema}&table=${table}`;

        if (column !== "") {
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
    ListViews = async (
        scope: string,
        schema?: string,
        searchPattern?: string
    ): Promise<Types.APIResponse> => {
        if (!this.PossibleScopes.includes(scope)) {
            return {
                error: new Error(
                    "Possible scope values are `PRIVATE`, `SUBSCRIPTION`, `PUBLIC`, `ALL`. Only capitals accepted"
                ),
            };
        }

        let endpoint: string = `/v2/discover/view?scope=${scope}`;

        if (schema !== "") {
            endpoint = `${endpoint}&schema=${schema}`;
        }

        if (searchPattern !== "") {
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
    ListBlockchains = async (): Promise<Types.APIResponse> => {
        const endpoint: string = `/v2/discover/blockchains`;

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
    ListBlockchainSchemas = async (
        chainId: string,
        schemaType?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = `/v2/discover/blockchains/${chainId}/schemas`;

        if (
            schemaType !== "" &&
            this.PossibleSchemaTypes.includes(schemaType)
        ) {
            endpoint = `${endpoint}?schemaType=${schemaType}`;
        } else {
            return {
                error: new Error(
                    "Possible schema type values are `sxt`, `community`, `core`"
                ),
            };
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
    ListBlockchainInformation = async (
        chainId: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = `/v2/discover/blockchains/${chainId}/meta`;

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
