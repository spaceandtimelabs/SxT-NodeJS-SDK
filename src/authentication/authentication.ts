import * as dotenv from "dotenv";

import * as Types from "../helpers/types.js";
import { QueryHelper } from "../helpers/queryhelper.js";
import { SetAccessToken, GetAccessToken } from "../helpers/accesstoken.js";

dotenv.config();

export default class Authentication {
    // Generate auth code
    GenerateAuthCode = async (
        userId: string,
        joinCode?: string | null
    ): Promise<Types.APIResponse> => {
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
    GenerateToken = async (
        userId: string,
        authCode: string,
        encodedSignature: string,
        base64PublicKey: string
    ): Promise<Types.APIResponse> => {
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
    RefreshToken = async (): Promise<Types.APIResponse> => {
        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}/v1/auth/refresh`,
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${GetAccessToken().accessToken}`,
            },
        };

        const refreshTokenObject = await QueryHelper(options, 200);
        if (refreshTokenObject.data?.accessToken.length > 0) {
            SetAccessToken(refreshTokenObject.data);
        }

        return refreshTokenObject;
    };

    // Validate Token
    ValidateToken = async (): Promise<Types.APIResponse> => {
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
    Logout = async (): Promise<Types.APIResponse> => {
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
    CheckUser = async (userId: string): Promise<Types.APIResponse> => {
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
