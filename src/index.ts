import Authentication from "./authentication/authentication.js";
import Authorization from "./authorization/authorization.js";
import DiscoveryAPI from "./discovery/discovery.js";
import SQLCore from "./sqlcore/sqlcore.js";
import Storage from "./storage/storage.js";

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

    Storage = () => {
        return new Storage();
    };
}

export { SpaceAndTime };
