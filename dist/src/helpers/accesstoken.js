var accessToken;
// Save access token
export const SetAccessToken = (inAccessToken) => {
    accessToken = inAccessToken;
};
// Retrieve access token
export const GetAccessToken = () => {
    return accessToken;
};
