import { TxStatusArgs } from '@palladxyz/mina-core'

import { TxStatusGraphQLProvider } from '../../src/Providers/TxStatus/TxStatusProvider'

const minaExplorerGql = 'https://proxy.devnet.minaexplorer.com/'

describe('TxStatusGraphQLProvider', () => {
  test('checkTxStatus', async () => {
    const args: TxStatusArgs = {
      ID: '3XpDTU4nx8aYjtRooxkf6eqLSVdzhEE4EEDQFTGkRYZZ9uRebxCTPYfC3731PKq5zK8nAqwQE7TUtGGveMGNhBhDrycFvnXEcWA6gtStmu4h9iiXG3CkFapgu9AZAKetNVjsx5ekVyRU8W5RHkBA9r5ntL36ddtodk9SCymkZ2qLhCGjpCaxuqih3kqWq3aVFwbNL5eQVrdgnYwZwuTTBdAVnYuqxkYKEKZuGGL12eZGBdnD1W9DMicXCkryzJx4dXJRas6ZrZGFEC8mTvtHZJ6ResVANXPfWuWKQu1xr8SPecfTuyKBC1VdeUqghpuHeznjTwdpNH6KBjvYkCzAuuaDrL8XgFHNC8Ka7bLBe9UXzemmtBxzQQs9uL3dZunhPudKn5aR42a4Z9rqtHC'
    }

    const provider = new TxStatusGraphQLProvider(minaExplorerGql)
    const response = await provider.checkTxStatus(args)

    expect(response).toBeDefined()
    console.log('TxStatus:', response)
    //expect(response.includes('INCLUDED')).toBe(true)
  })
})
