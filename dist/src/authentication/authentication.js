import * as dotenv from "dotenv";
import { QueryHelper } from "../helpers/queryhelper.js";
import { SetAccessToken, GetAccessToken } from "../helpers/accesstoken.js";
dotenv.config();
export default class Authentication {
    constructor() {
        // Generate auth code
        this.GenerateAuthCode = async (userId, joinCode) => {
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/code`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                data: {
                    userId: userId,
                    joinCode: joinCode,
                },
            };
            return QueryHelper(options, 200);
        };
        // Generate accessToken
        this.GenerateToken = async (userId, authCode, encodedSignature, base64PublicKey) => {
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/token`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                data: {
                    userId: userId,
                    authCode: authCode,
                    key: base64PublicKey,
                    signature: encodedSignature,
                    scheme: `${process.env.SCHEME}`,
                },
            };
            const accessTokenObject = await QueryHelper(options, 200);
            if (accessTokenObject.data?.accessToken.length > 0) {
                SetAccessToken(accessTokenObject.data);
            }
            return accessTokenObject;
        };
        // Refresh Token
        this.RefreshToken = async () => {
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/refresh`,
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            const refresTokenObject = await QueryHelper(options, 200);
            if (refresTokenObject.data?.accessToken.length > 0) {
                SetAccessToken(refresTokenObject.data);
            }
            return refresTokenObject;
        };
        // Validate Token
        this.ValidateToken = async () => {
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/validtoken`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 200);
        };
        // Logout
        this.Logout = async () => {
            const options = {
                method: "POST",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/logout`,
                headers: {
                    accept: "application/json",
                    authorization: `Bearer ${GetAccessToken().accessToken}`,
                },
            };
            return QueryHelper(options, 204);
        };
        // Check user
        this.CheckUser = async (userId) => {
            const options = {
                method: "GET",
                url: `${process.env.BASEURL_GENERAL}/v1/auth/idexists/${userId}`,
                headers: {
                    accept: "application/json",
                },
            };
            return QueryHelper(options, 200);
        };
    }
}
