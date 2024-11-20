import axios from "axios";
import * as Types from "./types.js";

export const QueryHelper = async (
    options: Types.Options,
    httpOk: number = 0
): Promise<Types.APIResponse> => {
    let output: Types.APIResponse = {};
    try {
        const result = await axios.request(options);
        if (httpOk <= 0) {
            output = {
                error: new Error(`No default http ok condition specified`),
            };
        } else {
            switch (httpOk) {
                case 200:
                    output = {
                        data: result.data,
                    };
                    break;
                case 204:
                    output = {
                        data: null,
                    };
                    break;
                default:
                    output = {
                        error: new Error(`Bad http ok condition`),
                    };
            }
        }
    } catch (err: any) {
        output = {
            error: err,
        };
    }

    return output;
};
