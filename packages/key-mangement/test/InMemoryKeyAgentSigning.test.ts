import { Mina } from '@palladxyz/mina-core'
import * as bip32 from '@scure/bip32'
import Client from 'mina-signer'
import sinon from 'sinon'
import { expect } from 'vitest'

import { emip3encrypt } from '../src/emip3'
import {
  getPassphraseRethrowTypedError,
  InMemoryKeyAgent,
  InMemoryKeyAgentProps
} from '../src/InMemoryKeyAgent'
import {
  AccountAddressDerivationPath,
  AccountKeyDerivationPath,
  Network
} from '../src/types'
import * as bip39 from '../src/util/bip39'
import { constructTransaction } from '../src/util/buildTx'

// Create a sandbox for managing and restoring stubs
const sandbox = sinon.createSandbox()
// Provide the passphrase for testing purposes
const params = {
  passphrase: 'passphrase'
}
const getPassphrase = async () => Buffer.from(params.passphrase)

describe('InMemoryKeyAgent', () => {
  let agentProps: InMemoryKeyAgentProps
  let agent: InMemoryKeyAgent
  let passphrase: Uint8Array
  let encryptedSeedBytes: Uint8Array
  let rootKeyBytes: Uint8Array
  let mnemonic: string[]
  let seed: Uint8Array
  let root: bip32.HDKey
  let networkType: Mina.NetworkType
  let network: Network
  let minaClient: Client
  let accountKeyDerivationPath: AccountKeyDerivationPath
  let accountAddressDerivationPath: AccountAddressDerivationPath

  beforeEach(async () => {
    // Create keys for testing purposes
    mnemonic = [
      'climb',
      'acquire',
      'robot',
      'select',
      'shaft',
      'zebra',
      'blush',
      'extend',
      'evolve',
      'host',
      'misery',
      'busy'
    ] //bip39.generateMnemonicWords(strength)
    seed = bip39.mnemonicToSeed(mnemonic, '')
    // Create root node from seed
    root = bip32.HDKey.fromMasterSeed(seed)
    // Derive a child key from the given derivation path
    //purposeKey = root.deriveChild(KeyConst.PURPOSE)
    //coinTypeKey = purposeKey.deriveChild(KeyConst.MINA_COIN_TYPE)
    // unencrypted root key bytes
    rootKeyBytes = root.privateKey ? root.privateKey : Buffer.from([])
    // unencrypted coin type key bytes
    //coinTypeKeyBytes = coinTypeKey.privateKey ? coinTypeKey.privateKey : Buffer.from([])
    // define the agent properties
    passphrase = await getPassphraseRethrowTypedError(getPassphrase)
    encryptedSeedBytes = await emip3encrypt(seed, passphrase)

    // Prepare agent properties
    agentProps = {
      getPassphrase,
      encryptedSeedBytes: encryptedSeedBytes,
      knownCredentials: []
    }

    // Create new agent
    agent = new InMemoryKeyAgent(agentProps)

    // network
    network = Network.Mina
    networkType = 'testnet'
    minaClient = new Client({ network: networkType })
    accountKeyDerivationPath = { account_ix: 0 }
    accountAddressDerivationPath = { address_ix: 0 }
  })
  afterEach(() => {
    // Restore all stubs after each test
    sandbox.restore()
  })

  it('should create an agent with given properties', async () => {
    expect(agent).to.be.instanceOf(InMemoryKeyAgent)
  })
  it('should export root private key', async () => {
    const result = await agent.exportRootPrivateKey()
    expect(result).to.deep.equal(rootKeyBytes)
  })
  describe('fromBip39MnemonicWords', () => {
    it('should create an agent that can sign a transaction', async () => {
      const agentFromBip39 = await InMemoryKeyAgent.fromBip39MnemonicWords({
        getPassphrase,
        mnemonicWords: mnemonic
      })

      const credentials = await agentFromBip39.deriveCredentials(
        accountKeyDerivationPath,
        accountAddressDerivationPath,
        network,
        networkType
      )

      const transaction: Mina.TransactionBody = {
        to: credentials.address,
        from: credentials.address,
        fee: 1,
        amount: 100,
        nonce: 0,
        memo: 'hello Bob',
        validUntil: 321,
        type: 'payment'
      }
      const constructedTx = constructTransaction(
        transaction,
        Mina.TransactionKind.PAYMENT
      )

      const signedTx = await agentFromBip39.signTransaction(
        accountKeyDerivationPath,
        accountAddressDerivationPath,
        constructedTx,
        networkType
      )
      console.log('signed Tx', signedTx)
      const isVerified = minaClient.verifyTransaction(signedTx)
      console.log('Signed Transaction isVerified?', isVerified)
      expect(isVerified).toBeTruthy()
    })
  })
})
