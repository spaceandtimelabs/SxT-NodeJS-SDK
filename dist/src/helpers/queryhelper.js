import axios from "axios";
export const QueryHelper = async (options, httpOk) => {
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
    }
    catch (err) {
        return {
            error: new Error(`${err.response.status}: ${err.response.data.title}. Detail: ${err.response.data.detail}`),
        };
    }
};
