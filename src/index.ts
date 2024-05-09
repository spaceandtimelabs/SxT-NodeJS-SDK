import Authentication from "./authentication/authentication";
import Authorization from "./authorization/authorization";
import DiscoveryAPI from "./discovery/discovery";

export default class SpaceAndTimeSDK {
    Authentication = () => {
        return new Authentication();
    };

    Authorization = () => {
        return new Authorization();
    };

    DiscoveryAPI = () => {
        return new DiscoveryAPI();
    };
}
