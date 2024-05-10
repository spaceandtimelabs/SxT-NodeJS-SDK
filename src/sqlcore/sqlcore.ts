import * as Types from "../helpers/types.js";
import { GetAccessToken } from "../helpers/accesstoken.js";
import { QueryHelper } from "../helpers/queryhelper.js";

export default class SQLCore {
    // DDL Queries
    DDL = async (
        sqlText: string,
        biscuits?: string[],
        originApp?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = "/v1/sql/ddl";

        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}${endpoint}`,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${GetAccessToken().accessToken}`,
                originApp: originApp,
            },
            body: {
                sqlText: sqlText,
                biscuits: biscuits,
            },
        };

        return QueryHelper(options, 200);
    };

    // DML Queries
    DML = async (
        sqlText: string,
        biscuits?: string[],
        resources?: string[],
        originApp?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = "/v1/sql/dml";

        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}${endpoint}`,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${GetAccessToken().accessToken}`,
                originApp: originApp,
            },
            body: {
                sqlText: sqlText,
                biscuits: biscuits,
                resources: resources,
            },
        };

        return QueryHelper(options, 200);
    };

    // DQL Queries
    DQL = async (
        sqlText: string,
        biscuits?: string[],
        resources?: string[],
        originApp?: string
    ): Promise<Types.APIResponse> => {
        let endpoint: string = "/v1/sql/dql";

        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}${endpoint}`,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${GetAccessToken().accessToken}`,
                originApp: originApp,
            },
            body: {
                sqlText: sqlText,
                biscuits: biscuits,
                resources: resources,
            },
        };

        return QueryHelper(options, 200);
    };
}
