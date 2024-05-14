import * as Types from "../helpers/types.js";

var credentials: Types.Credentials;

// Set credentials
export const SetCredentials = (inCredentials: Types.Credentials) => {
    credentials = inCredentials;
};

// Retrieve credentials
export const GetCredentials = (): Types.Credentials => {
    return credentials;
};
