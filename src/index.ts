import Authentication from "./authentication/authentication.js";
import Authorization from "./authorization/authorization.js";
import DiscoveryAPI from "./discovery/discovery.js";
import SQLCore from "./sqlcore/sqlcore.js";

class SpaceAndTime {
    Authentication = () => {
        return new Authentication();
    };

    Authorization = () => {
        return new Authorization();
    };

    DiscoveryAPI = () => {
        return new DiscoveryAPI();
    };

    SqlAPI = () => {
        return new SQLCore();
    };
}

export { SpaceAndTime };
