const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const types = require("../gep/farming_policy_gold_aug_2022/types.json");
const keyFile = require('./key.json')

require("./params.js");

async function main() {
  const myArgs = process.argv.slice(2);
  console.log("myArgs: ", myArgs);

  const farmToMark = parseInt(myArgs[0]);

  const provider = new WsProvider(url);
  const api = await ApiPromise.create({ provider, types });
  const keyring = new Keyring({ type: "sr25519" });

  let key
  if (mnemonic && mnemonic !== '') {
    key = keyring.addFromUri(mnemonic);
  } else {
    key = keyring.addFromJson(keyFile)
    key.unlock(process.env.PASSWORD)
  }
  console.log(`key loaded with address ${key.address}`)

  const members = await api.query.council.members();
  const threshold = (members.length / 2) + 1

  const attachTx = api.tx.tfgridModule.setFarmCertification(farmToMark, "Gold")

  const farmCertificationProposal = api.tx.council
    .propose(threshold, attachTx, attachTx.length)

  const hash = await farmCertificationProposal.signAndSend(key)
  console.log(`transaction submitted with hash ${hash}`);

  process.exit(0)
}

main();
