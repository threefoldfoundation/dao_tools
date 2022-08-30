const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const types = require("../gep/farming_policy_gold_aug_2022/types.json");

require("./params.js");

async function main() {
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

  let AccNonce = await api.rpc.system.accountNextIndex(key.address);

  const proposals = await api.query.council.proposals();
  const parsedProposals = proposals.map((p) => p.toHex());

  const proposalsWithIndex = await parsedProposals.map(async (p) => {
    const voting = await api.query.council.voting(p);

    return {
      hash: p,
      index: voting.toJSON().index,
    };
  });

  const proposalsToVote = await Promise.all(proposalsWithIndex);

  let nonce = AccNonce.toNumber();
  const voteCalls = [];
  proposalsToVote.forEach((p) => {
    console.log(p.hash);
    const tx = api.tx.council
      .vote(p.hash, p.index, true)
      .signAndSend(key, { nonce: api.createType("Index", nonce) }, callback);
    voteCalls.push(tx);
    nonce += 1;
  });

  const hashes = await Promise.all(voteCalls);
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
