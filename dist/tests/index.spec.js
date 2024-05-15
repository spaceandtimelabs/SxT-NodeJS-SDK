import { describe, it } from "node:test";
import Authentication from "../src/authentication/authentication.js";
import assert from "node:assert";
// Instantiate SXT
describe("User Service Tests", () => {
    it("should return user data when id is 1", async () => {
        const auth = new Authentication();
        const check = await auth.CheckUser("test-trial-2");
        // assert that the user id is 1
        assert.equal(check.data, true);
    });
});
