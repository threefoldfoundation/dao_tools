const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const types = require("../gep/farming_policy_gold_aug_2022/types.json");
const keyFile = require('./key.json')

require("./params.js");

async function main() {
  const myArgs = process.argv.slice(2);
  console.log("myArgs: ", myArgs);

  const farmToAttach = parseInt(myArgs[0]);
  const farmingPolicyID = parseInt(myArgs[1]);

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

  //nov 1 2022
  var datum = new Date(Date.UTC('2022', '11', '1', '0', '0', '0'));
  var enddate = datum.getTime() / 1000;

  // FARMID we can only fill in once we have the policy approved
  const limits = {
    // Change to newly created policy ID
    farming_policy_id: farmingPolicyID,
    // Limit of CU (optional) INTEGER
    cu: undefined,
    // Limit of SU (optional) INTEGER
    su: undefined,
    // End (optional) expressed as timestamp
    end: enddate,
    // Number of nodes that can connect to this policy
    // Will fallback to default policy if the number of nodes connected exceed this
    // OPTIONAL
    nodeCount: undefined,
    // If nodes need to be certified yes/no
    node_certification: true
  }

  const attachTx = api.tx.tfgridModule.attachPolicyToFarm(farmToAttach, limits)

  const farmCertificationProposal = api.tx.council
    .propose(threshold, attachTx, attachTx.length)

  const hash = await farmCertificationProposal.signAndSend(key)
  console.log(`transaction submitted with hash ${hash}`);

  process.exit(0)
}

const callback = ({ events = [], status }) => {
  console.log("Transaction status:", status.type);

  if (status.isInBlock) {
    console.log("Included at block hash", status.asInBlock.toHex());
    console.log("Events:");

    events.forEach(({ event: { data, method, section }, phase }) => {
      console.log(
        "\t",
        phase.toString(),
        `: ${section}.${method}`,
        data.toString()
      );
    });
  } else if (status.isFinalized) {
    console.log("Finalized block hash", status.asFinalized.toHex());

    // process.exit(0);
  }
};

main();
