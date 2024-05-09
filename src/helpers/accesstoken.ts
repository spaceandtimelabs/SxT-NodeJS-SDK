import * as Types from "../helpers/types";

var accessToken: Types.AccessTokenObject;

export const SetAccessToken = (inAccessToken: Types.AccessTokenObject) => {
    accessToken = inAccessToken;
};

export const GetAccessToken = (): Types.AccessTokenObject => {
    return accessToken;
};
