import axios from "axios";
export const QueryHelper = async (options, httpOk = 0) => {
    let output = {};
    try {
        const result = await axios.request(options);
        if (httpOk <= 0) {
            output = {
                error: new Error(`No default http ok condition specified`),
            };
        }
        else {
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
    }
    catch (err) {
        output = {
            error: err,
        };
    }
    return output;
};
