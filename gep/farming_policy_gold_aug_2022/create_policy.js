const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')

require("./params.js");

async function main() {
  
  const provider = new WsProvider(url)
  const api = await ApiPromise.create({ provider, types })
  const keyring = new Keyring({ type: 'sr25519' })
  const key = keyring.addFromUri(mnemonic)
  console.log(key.address)

  // Adjust params
  const name = "gold_policy_aug22"
  // SU, CU, NU, IPV4 Must be specified in mUSD (1/1000 of usd)
  const cu = 2400 * 1.5
  const su = 1500 * 1.5
  const nu = 30 * 1.5
  const ipv4 = 5 //calculated per hour, so 5 means 3.6 USD per month
  const minimalUptime = 998  //is nr in 1000
  // optional policy end (must be specified in number of blocks, a block is 6 seconds)
  // const policyEnd = 1296000 //is 3 month from now = 3 * 30 * 24 * 3600 / 6
  // 0 means forever
  const policyEnd = 0
  const immutable = true
  //means generic grid can use a default policy, if for specific farm can never be default
  const defaultPolicy = false
  const nodeCertification = 'Certified' //Diy or Certified
  const farmCertification = 'Gold' //Gold or NotCertified (default)

  const tx = api.tx.tfgridModule.createFarmingPolicy(
    name,
    su,
    cu,
    nu,
    ipv4,
    minimalUptime,
    policyEnd,
    immutable,
    defaultPolicy,
    nodeCertification,
    farmCertification
  )

  // amount of farmers need to vote on the proposal before it can be closed
  const threshold = nrvotes
  const action = tx
  // description about the proposal
  const description = 'farming policy gold aug 22 2022'
  // link to forum post
  const link = 'https://forum.threefold.io/t/gep-gold-certified-farming-specs-closed/2925'
  // duration is optional (number of blocks the proposal is valid)
  const duration = vote_valid_blocks
  const proposal = api.tx.dao.propose(
    threshold,
    action,
    description,
    link,
    duration
  )

  const hash = await proposal.signAndSend(key)

  console.log(`call submitted with hash ${hash}`)

  console.log(`TFGrid Farmers can now vote on proposal`)

  process.exit(0)
}

main()