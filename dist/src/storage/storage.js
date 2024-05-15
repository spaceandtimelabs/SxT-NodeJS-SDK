import { writeFileSync, readFileSync } from "fs";
import { SetCredentials, GetCredentials } from "../helpers/credentials.js";
import { SetAccessToken, GetAccessToken } from "../helpers/accesstoken.js";
export default class Storage {
    constructor() {
        // Write credentials (userid, private key, public key, biscuit)
        this.WriteCredentials = (credentials, filePath) => {
            try {
                writeFileSync(filePath, credentials, {
                    flag: "w",
                });
            }
            catch (err) {
                return false;
            }
            console.log(`Wrote credentials to ${filePath}`);
        };
        // Write session
        this.WriteSession = (session, filePath) => {
            writeFileSync(filePath, session, {
                flag: "w",
            });
            console.log(`Wrote session to ${filePath}`);
        };
        // Check contents from credentials.json
        this.ReadCredentials = (filePath) => {
            try {
                const data = readFileSync(filePath, "utf8");
                const fileData = JSON.parse(data);
                SetCredentials(fileData);
            }
            catch (err) {
                return {
                    error: err,
                };
            }
            return {
                data: GetCredentials(),
            };
        };
        // Check if session.json has valid session
        this.ReadSession = (filePath) => {
            try {
                const data = readFileSync(filePath, "utf8");
                const fileData = JSON.parse(data);
                SetAccessToken(fileData);
            }
            catch (err) {
                return { error: err };
            }
            return {
                data: GetAccessToken(),
            };
        };
    }
}
