import SpaceAndTimeSDK from "../src/index";

const sxt = new SpaceAndTimeSDK();
const auth = sxt.Authentication();
console.log(auth);

const discovery = sxt.DiscoveryAPI();
console.log(discovery);
