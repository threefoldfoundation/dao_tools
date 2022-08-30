const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api");
const types = require("../gep/farming_policy_gold_aug_2022/types.json");

require("./params.js");

async function main() {
  const provider = new WsProvider(url);
  const api = await ApiPromise.create({ provider, types });
  const keyring = new Keyring({ type: "sr25519" });
  const key = keyring.addFromUri(mnemonic);
  let AccNonce = await api.rpc.system.accountNextIndex(key.address);

  const proposals = await api.query.council.proposals();
  const parsedProposals = proposals.map((p) => p.toHex());

  const proposalsWithIndex = await parsedProposals.map(async (p) => {
    const voting = await api.query.council.voting(p);
    const call = await api.query.council.proposalOf(p);
    return {
      hash: p,
      index: voting.toJSON().index,
      call,
    };
  });

  const proposalsToVote = await Promise.all(proposalsWithIndex);

  let nonce = AccNonce.toNumber();
  const voteCalls = [];
  proposalsToVote.forEach((p) => {
    console.log(p.hash);
    const tx = api.tx.council
      .close(p.hash, p.index, 0, p.call.length)
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
