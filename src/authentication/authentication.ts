import axios from "axios";
import * as dotenv from "dotenv";

import * as Types from "../helpers/types";

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
                "Content-Type": "application/json",
            },
            data: {
                userId: userId,
                joinCode: joinCode,
            },
        };

        const result = await axios.request(options);
        if (result.status !== 200 || result.data.length <= 0) {
            return {
                error: new Error(
                    `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                ),
            };
        }

        return {
            data: result.data,
        };
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
            },
            data: {
                userId: userId,
                authCode: authCode,
                key: base64PublicKey,
                signature: encodedSignature,
                scheme: `${process.env.SCHEME}`,
            },
        };

        const result = await axios.request(options);
        if (result.status !== 200 || result.data.length <= 0) {
            return {
                error: new Error(
                    `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                ),
            };
        }

        return {
            data: result.data,
        };
    };

    // Refresh Token
    RefreshToken = async (accessToken: string): Promise<Types.APIResponse> => {
        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}/v1/auth/refresh`,
            headers: {
                accept: "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        };

        const result = await axios.request(options);
        if (result.status !== 200 || result.data.length <= 0) {
            return {
                error: new Error(
                    `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                ),
            };
        }

        return {
            data: result.data,
        };
    };

    // Validate Token
    ValidateToken = async (accessToken: string): Promise<Types.APIResponse> => {
        const options = {
            method: "GET",
            url: `${process.env.BASEURL_GENERAL}/v1/auth/validtoken`,
            headers: {
                accept: "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        };

        const result = await axios.request(options);
        if (result.status !== 200 || result.data.length <= 0) {
            return {
                error: new Error(
                    `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                ),
            };
        }

        return {
            data: result.data,
        };
    };

    // Logout
    Logout = async (accessToken: string): Promise<Types.APIResponse> => {
        const options = {
            method: "POST",
            url: `${process.env.BASEURL_GENERAL}/v1/auth/logout`,
            headers: {
                accept: "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        };

        const result = await axios.request(options);
        if (result.status !== 204) {
            return {
                error: new Error(
                    `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                ),
            };
        }

        return {
            data: result.data,
        };
    };
}
