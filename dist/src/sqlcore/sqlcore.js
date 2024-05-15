import { GetAccessToken } from "../helpers/accesstoken.js";
import { QueryHelper } from "../helpers/queryhelper.js";
export default class SQLCore {
    constructor() {
        // DDL Queries
        this.DDL = async (sqlText, biscuits, originApp) => {
            let endpoint = "/v1/sql/ddl";
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                    originApp: originApp,
                },
                data: {
                    sqlText: sqlText,
                    biscuits: biscuits,
                },
            };
            return QueryHelper(options, 200);
        };
        // DML Queries
        this.DML = async (sqlText, biscuits, resources, originApp) => {
            let endpoint = "/v1/sql/dml";
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                    originApp: originApp,
                },
                data: {
                    sqlText: sqlText,
                    biscuits: biscuits,
                    resources: resources,
                },
            };
            return QueryHelper(options, 200);
        };
        // DQL Queries
        this.DQL = async (sqlText, biscuits, resources, originApp) => {
            let endpoint = "/v1/sql/dql";
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}${endpoint}`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                    originApp: originApp,
                },
                data: {
                    sqlText: sqlText,
                    biscuits: biscuits,
                    resources: resources,
                },
            };
            return QueryHelper(options, 200);
        };
    }
}
