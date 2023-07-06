import { Network } from '@palladxyz/key-generator'
import { Mina } from '@palladxyz/mina-core'
//import { Mina, SubmitTxArgs } from '@palladxyz/mina-core'
import {
  AccountInfoGraphQLProvider,
  ChainHistoryGraphQLProvider,
  TxSubmitGraphQLProvider
} from '@palladxyz/mina-graphql'
import { accountStore, vaultStore } from '@palladxyz/vault'
import { expect, test } from 'vitest'

import { MinaWalletImpl } from '../src/Wallet'

const ACCOUNT_INFO_PROVIDER_URL = 'https://proxy.devnet.minaexplorer.com/'
const CHAIN_HISTORY_PROVIDER_URL = 'https://devnet.graphql.minaexplorer.com'
const TX_SUBMIT_PROVIDER_URL = 'https://proxy.devnet.minaexplorer.com/'

describe('MinaWalletImpl', () => {
  let wallet: MinaWalletImpl
  let network: Network

  const accountInfoProvider = new AccountInfoGraphQLProvider(
    ACCOUNT_INFO_PROVIDER_URL
  )
  const chainHistoryProvider = new ChainHistoryGraphQLProvider(
    CHAIN_HISTORY_PROVIDER_URL
  )

  const txSubmitProvider = new TxSubmitGraphQLProvider(TX_SUBMIT_PROVIDER_URL)

  beforeEach(() => {
    network = Network.Mina
    wallet = new MinaWalletImpl(
      accountInfoProvider,
      chainHistoryProvider,
      txSubmitProvider,
      network
    )
  })

  test('wallet fetches getAccountInfo', async () => {
    const publicKey = 'B62qjsV6WQwTeEWrNrRRBP6VaaLvQhwWTnFi4WP4LQjGvpfZEumXzxb'
    const accountInfo = await wallet.getAccountInfo(publicKey)

    if (accountInfo === null) {
      throw new Error('Account info is undefined')
    }

    expect(accountInfo.balance).toBeDefined()
    expect(accountInfo.nonce).toBeDefined()
    expect(accountInfo.inferredNonce).toBeDefined()
    expect(accountInfo.delegate).toBeDefined()
    expect(accountInfo.publicKey).toBeDefined()

    // Check Zustand store has updated correctly
    const storeState = accountStore.getState()
    console.log('Account Info in Store:', storeState.accountInfo)
    expect(storeState.accountInfo).toEqual(accountInfo)
  })

  test('wallet fetches getTransactions', async () => {
    const publicKey = 'B62qjsV6WQwTeEWrNrRRBP6VaaLvQhwWTnFi4WP4LQjGvpfZEumXzxb'
    const transactions = await wallet.getTransactions(publicKey)

    expect(transactions).toBeDefined()
    expect(transactions.length).toBeLessThanOrEqual(20)

    transactions.forEach((tx) => {
      // Add some checks for the properties that each transaction should have
      expect(tx.amount).toBeDefined()
      expect(tx.blockHeight).toBeDefined()
      expect(tx.dateTime).toBeDefined()
      expect(tx.failureReason).toBeDefined()
      expect(tx.fee).toBeDefined()
      expect(tx.from).toBeDefined()
      expect(tx.hash).toBeDefined()
      expect(tx.isDelegation).toBeDefined()
      expect(tx.kind).toBeDefined()
      expect(tx.to).toBeDefined()
      expect(tx.token).toBeDefined()
    })
    // Check Zustand store has updated correctly
    const storeState = accountStore.getState()
    console.log('Transactions in Store:', storeState.transactions)
    expect(storeState.transactions).toEqual(transactions)
  })
  test('wallet creates a new wallet', async () => {
    const walletName = 'Test Wallet'
    const accountNumber = 0
    const newWallet = await wallet.createWallet(walletName, accountNumber)

    if (newWallet === null) {
      throw new Error('New wallet is undefined')
    }

    expect(newWallet).toBeDefined()
    expect(newWallet.publicKey).toBeDefined()
    expect(newWallet.mnemonic).toBeDefined()

    // TODO: Check if the new wallet is correctly stored in the vault
    const walletStoreState = vaultStore.getState()
    console.log('Wallet Vault in Store:', walletStoreState)
    //expect(walletStoreState....).toEqual(...)
  })

  test('wallet restores a wallet', async () => {
    const walletName = 'Restored Wallet'
    const mnemonic =
      'habit hope tip crystal because grunt nation idea electric witness alert like'
    const accountNumber = 0
    const restoredWallet = await wallet.restoreWallet(
      walletName,
      mnemonic,
      accountNumber
    )

    if (restoredWallet === null) {
      throw new Error('New wallet is undefined')
    }

    expect(restoredWallet).toBeDefined()
    expect(restoredWallet.publicKey).toEqual(
      'B62qjsV6WQwTeEWrNrRRBP6VaaLvQhwWTnFi4WP4LQjGvpfZEumXzxb'
    )

    // TODO: Check if the restored wallet is correctly stored in the vault
  })

  test('wallet gets the current wallet', async () => {
    const currentWallet = wallet.getCurrentWallet()

    if (currentWallet === null) {
      throw new Error('New wallet is undefined')
    }

    expect(currentWallet).toBeDefined()
    expect(currentWallet.walletName).toBeDefined()
    expect(currentWallet.walletPublicKey).toBeDefined()

    // TODO: Check if the current wallet matches the one in the vault
  })
  /*
  test('create multiple wallets using the same store', async () => {
  })*/

  test('restore a wallet and sign a transaction', async () => {
    const walletName = 'Restored Wallet'
    const mnemonic =
      'habit hope tip crystal because grunt nation idea electric witness alert like'
    const accountNumber = 0
    const restoredWallet = await wallet.restoreWallet(
      walletName,
      mnemonic,
      accountNumber
    )

    if (restoredWallet === null) {
      throw new Error('New wallet is undefined')
    }

    expect(restoredWallet).toBeDefined()
    expect(restoredWallet.publicKey).toEqual(
      'B62qjsV6WQwTeEWrNrRRBP6VaaLvQhwWTnFi4WP4LQjGvpfZEumXzxb'
    )
    const walletPublicKey = restoredWallet.publicKey
    const payment: Mina.TransactionBody = {
      type: 'payment',
      to: walletPublicKey,
      from: walletPublicKey,
      fee: 1,
      nonce: 0,
      memo: 'hello Bob',
      validUntil: 321,
      amount: 100
    }

    const constructedPayment = await wallet.constructTx(
      payment,
      Mina.TransactionKind.PAYMENT
    )
    const signedPayment = await wallet.signTx(constructedPayment)
    expect(signedPayment.data).toBeDefined()
    expect(signedPayment.signature).toBeDefined()

    // TODO: Verify if the transaction is correctly signed
  })
})
/*test('wallet submits a transaction', async () => {
    const submitTxArgs: SubmitTxArgs = {} // replace this with a SubmitTxArgs object
    const result = await wallet.submitTx(submitTxArgs)

    expect(result).toBeDefined()

    // TODO: Verify if the transaction is correctly submitted
  })*/
