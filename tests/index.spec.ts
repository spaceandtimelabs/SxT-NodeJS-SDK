import { describe, it } from "node:test";
import Authentication from "../src/authentication/authentication.js";
import assert from "node:assert";

// Authentication
describe("Check if user exists", () => {
    it("should return true", async () => {
        const auth = new Authentication();
        const check = await auth.CheckUser("test-trial-1");
        assert.equal(check.data, true);
    });
});
