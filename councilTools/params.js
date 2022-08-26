// Fill in your mnemonic here
// BE SURE YOU ARE A MEMBER OF THE COUNCIL ON TFCHAIN BEFORE RUNNING THIS SCRIPT
//the key below is for devnet for test, replace with your own
mnemonic = process.env.KEY;

// Specify url to chain
url = process.env.NET;
// GLOBAL.url = "ws://localhost:9944"

types = require("./types.json");

if (!mnemonic) {
  // strValue was empty string, false, 0, null, undefined, ...
  throw new Error("KEY = mnemonic has not been set, please do export...");
}

if (!url) {
  throw new Error("NET has not been set, please do export...");
}
