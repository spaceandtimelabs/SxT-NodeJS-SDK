import { writeFileSync, readFileSync } from "fs";
import * as Types from "../helpers/types.js";
import { SetCredentials, GetCredentials } from "../helpers/credentials.js";
import { SetAccessToken, GetAccessToken } from "../helpers/accesstoken.js";

export default class Storage {
    // Write credentials (userid, private key, public key, biscuit)
    WriteCredentials = (credentials: string, filePath: string) => {
        try {
            writeFileSync(filePath, credentials, {
                flag: "w",
            });
        } catch (err) {
            return false;
        }

        console.log(`Wrote credentials to ${filePath}`);
    };

    // Write session
    WriteSession = (session: string, filePath: string) => {
        writeFileSync(filePath, session, {
            flag: "w",
        });
        console.log(`Wrote session to ${filePath}`);
    };

    // Check contents from credentials.json
    ReadCredentials = (filePath: string): Types.APIResponse => {
        try {
            const data = readFileSync(filePath, "utf8");
            const fileData: Types.Credentials = JSON.parse(data);
            SetCredentials(fileData);
        } catch (err) {
            return {
                error: err,
            };
        }
        return {
            data: GetCredentials(),
        };
    };

    // Check if session.json has valid session
    ReadSession = (filePath: string): Types.APIResponse => {
        try {
            const data = readFileSync(filePath, "utf8");
            const fileData: Types.AccessTokenObject = JSON.parse(data);
            SetAccessToken(fileData);
        } catch (err) {
            return { error: err };
        }
        return {
            data: GetAccessToken(),
        };
    };
}
