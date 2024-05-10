import { writeFileSync } from "fs";

// Write bisucit for a resource
export const WriteBiscuits = (biscuit: string) => {
    writeFileSync("biscuit.txt", biscuit, {
        flag: "w",
    });
    console.log("Wrote biscuit");
};

// Write credentials (userid, private key, public key)
export const WriteCredentials = (credentials: string) => {
    writeFileSync("credentails.txt", credentials, {
        flag: "w",
    });
    console.log("Wrote credentails");
};

// Write session
export const WriteSession = (session: string) => {
    writeFileSync("session.txt", session, {
        flag: "w",
    });
    console.log("Wrote session");
};
