import axios from "axios";
import * as Types from "./types.js";

export const QueryHelper = async (
    options: Types.Options,
    httpOk: number
): Promise<Types.APIResponse> => {
    let output: Types.APIResponse = {};
    try {
        const result = await axios.request(options);
        switch (httpOk) {
            case 200:
                output = {
                    data: result.data,
                };
            case 204:
                output = {
                    data: null,
                };
        }
        output = {
            error: new Error(`No default http ok condition specified`),
        };
    } catch (err) {
        output = {
            error: new Error(`Something went wrong while calling the API`),
        };
    }

    return output;
};
