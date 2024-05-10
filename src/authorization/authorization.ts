import * as Types from "../helpers/types.js";

import { PrivateKey, biscuit, block } from "@biscuit-auth/biscuit-wasm";

export default class Authorization {
    // Create biscuit from the given rules
    CreateBiscuitToken = (
        capabilities: Types.BiscuitCapabilities[],
        privKey: string
    ): Types.APIResponse => {
        let biscuitTokens: string[];
        let biscuitBuilder = biscuit``;

        for (let capabilityObj of capabilities) {
            let biscuitBlock = block`sxt:capability(${capabilityObj.operation}, ${capabilityObj.resource})`;
            biscuitBuilder.merge(biscuitBlock);
        }
        let wildCardBiscuitToken = biscuitBuilder
            .build(PrivateKey.fromString(privKey))
            .toBase64();
        biscuitTokens.push(wildCardBiscuitToken);

        return { data: biscuitTokens };
    };

    // Create wildcard biscuit from the given rules
    CreateWildcardBiscuitToken = (
        capabilities: Types.BiscuitCapabilities,
        privKey: string
    ): Types.APIResponse => {
        let biscuitTokens: string[];
        let biscuitBuilder = biscuit``;

        let biscuitBlock = block`sxt:capability(*, ${capabilities.resource})`;
        biscuitBuilder.merge(biscuitBlock);

        let wildCardBiscuitToken = biscuitBuilder
            .build(PrivateKey.fromString(privKey))
            .toBase64();
        biscuitTokens.push(wildCardBiscuitToken);

        return { data: biscuitTokens };
    };
}
