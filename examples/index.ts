import { SpaceAndTime } from "../src/index.js";

const sxt = new SpaceAndTime();
const auth = sxt.Authentication();
const a = await auth.GenerateAuthCode("asdads");
console.log(a);
