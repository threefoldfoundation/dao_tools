const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')

require("./params.js");

async function main() {

  const provider = new WsProvider(url)
  const api = await ApiPromise.create({ provider, types })
  const keyring = new Keyring({ type: 'sr25519' })
  const key = keyring.addFromUri(mnemonic)

  //nov 1 2022
  var datum = new Date(Date.UTC('2022','11','1','0','0','0'));
  var enddate = datum.getTime()/1000;

  // FARMID we can only fill in once we have the policy approved
  const limits = {
    // Change to newly created policy ID
    farmingPolicyID: farmingpolicyid,
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
    nodeCertification: yes
  }

  const tx = api.tx.tfgridModule.attachPolicyToFarm(farmid, limits)

  
  // amount of farmers need to vote on the proposal before it can be closed
  const threshold = nrvotes
  const action = tx
  // description about the proposal
  const description = 'farming policy gold aug 19 2022 for farm '+farmid
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