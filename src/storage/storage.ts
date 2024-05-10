import { writeFileSync } from "fs";

export default class Storage {
    // Write credentials (userid, private key, public key, biscuit)
    WriteCredentials = (credentials: string) => {
        writeFileSync("credentials.txt", credentials, {
            flag: "w",
        });
        console.log("Wrote credentials");
    };

    // Write session
    WriteSession = (session: string) => {
        writeFileSync("session.txt", session, {
            flag: "w",
        });
        console.log("Wrote session");
    };
}
