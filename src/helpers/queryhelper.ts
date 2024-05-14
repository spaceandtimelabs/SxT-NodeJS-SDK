import axios from "axios";
import * as Types from "./types.js";

export const QueryHelper = async (
    options: Types.Options,
    httpOk: number
): Promise<Types.APIResponse> => {
    try {
        const result = await axios.request(options);
        switch (httpOk) {
            case 200:
                return {
                    data: result.data,
                };
            case 204:
                return {
                    data: null,
                };
        }
    } catch (err) {
        return {
            error: new Error(
                `${err.response.status}: ${err.response.data.title}. Detail: ${err.response.data.detail}`
            ),
        };
    }
};
