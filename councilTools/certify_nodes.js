const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const types = require("../gep/farming_policy_gold_aug_2022/types.json");
const keyFile = require('./key.json')

require("./params.js");

async function main() {
  const myArgs = process.argv.slice(2);
  console.log("myArgs: ", myArgs);

  const farmToAttach = parseInt(myArgs[0]);
  const dryRun = myArgs[1] === "true";

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

  const farmsWithNodes = new Map();

  let AccNonce = await api.rpc.system.accountNextIndex(key.address);

  const nodes = await api.query.tfgridModule.nodes.entries();
  const parsedNodes = nodes.map((node) => {
    const n = node[1].toJSON()
    if (n.farm_id) {
      n.farmId = n.farm_id
    }
    return n
  });

  parsedNodes.forEach((node) => {
    if (farmToAttach !== node.farmId) {
      return;
    }

    let farmNodes = farmsWithNodes.get(node.farmId);
    if (!farmNodes) {
      farmNodes = [];
    } else {
      farmNodes.push(node.id);
    }

    farmsWithNodes.set(node.farmId, farmNodes);
  });

  console.log(farmsWithNodes);
  if (dryRun) {
    process.exit(0);
  }
  // dry run or not

  let allTransaction = [];

  let nonce = AccNonce.toNumber();
  console.log(`nonce at start ${nonce}`);
  farmsWithNodes.forEach((nodes, farmId) => {
    // Certify nodes
    nodes.forEach((n) => {
      console.log(`calling node cert with id ${n} with nonce: ${nonce}`);

      const nodeTx = api.tx.tfgridModule.setNodeCertification(
        api.createType("u32", n),
        api.createType("NodeCertification", "Certified")
      ).signAndSend(key, { nonce: api.createType("Index", nonce) }, callback);

      allTransaction.push(nodeTx)
      nonce += 1;
    });
  });

  const hashes = await Promise.all(allTransaction);
  console.log(`transaction submitted with hashes`);
  hashes.forEach((h) => console.log(h));

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
