import * as Types from "../helpers/types.js";

var accessToken: Types.AccessTokenObject;

// Save access token
export const SetAccessToken = (inAccessToken: Types.AccessTokenObject) => {
    accessToken = inAccessToken;
};

// Retrieve access token
export const GetAccessToken = (): Types.AccessTokenObject => {
    return accessToken;
};
