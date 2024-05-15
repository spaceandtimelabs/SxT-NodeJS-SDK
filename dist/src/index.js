import Authentication from "./authentication/authentication.js";
import Authorization from "./authorization/authorization.js";
import DiscoveryAPI from "./discovery/discovery.js";
import SQLCore from "./sqlcore/sqlcore.js";
import Storage from "./storage/storage.js";
class SpaceAndTime {
    constructor() {
        this.Authentication = () => {
            return new Authentication();
        };
        this.Authorization = () => {
            return new Authorization();
        };
        this.DiscoveryAPI = () => {
            return new DiscoveryAPI();
        };
        this.SqlAPI = () => {
            return new SQLCore();
        };
        this.Storage = () => {
            return new Storage();
        };
    }
}
export { SpaceAndTime };
