import axios from "axios";
import * as Types from "./types.js";

export const QueryHelper = async (
    options: Types.Options,
    httpOk: number
): Promise<Types.APIResponse> => {
    const result = await axios.request(options);

    switch (httpOk) {
        case 200:
            if (result.status !== 200 || result.data.length <= 0) {
                return {
                    error: new Error(
                        `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                    ),
                };
            }
            return {
                data: result.data,
            };
        case 204:
            if (result.status !== 204) {
                return {
                    error: new Error(
                        `${result.status}: ${result.data.title}. Detail: ${result.data.detail}`
                    ),
                };
            }
            return {
                data: null,
            };
    }
};
