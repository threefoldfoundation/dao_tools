
  // Fill in your mnemonic here
// BE SURE YOU ARE A MEMBER OF THE COUNCIL ON TFCHAIN BEFORE RUNNING THIS SCRIPT
//the key below is for devnet for test, replace with your own
mnemonic = process.env.KEY; 

// Specify url to chain
url = process.env.NET; 
// GLOBAL.url = "ws://localhost:9944"

types = require('./types.json')

//validity of proposal = for 14 days
//is per 6 sec
validhours = process.env.VALIDHOURS; 

//needs to be set for each farm and run again
farmid = process.env.FARMID; 
nrvotes = process.env.NRVOTES; 

farmingpolicyid = process.env.FARMINGPOLICYID; 

if (!farmingpolicyid || !farmingpolicyid>1){
  throw new Error('FARMINGPOLICYID has not been set or is < 1');
}

if (!farmid || !farmid>1){
  throw new Error('FARMID has not been set or is < 1');
}

if (!nrvotes || !nrvotes>1){
  throw new Error('NRVOTES has not been set or is < 1');
}

if (!validhours || validhours<1){
  throw new Error('VALIDHOURS has not been set or is < 1');
}
if (!mnemonic) {
  // strValue was empty string, false, 0, null, undefined, ...
  throw new Error('KEY = mnemonic has not been set, please do export...');
}

if (!url) {
  throw new Error('NET has not been set, please do export...');
}

vote_valid_blocks =  validhours * 3600 / 6
