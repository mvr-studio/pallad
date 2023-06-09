import { expect } from 'vitest'

import { EVMKeyGenerator } from '../src/evm'
import { KeyGeneratorFactory } from '../src/KeyGeneratorFactory'
import { MinaKeyGenerator } from '../src/mina'
import { Network } from '../src/types'

describe('KeyGeneratorFactory', () => {
  it('should create an EVMKeyGenerator instance for Ethereum network', () => {
    const keyGen = KeyGeneratorFactory.create(Network.Ethereum)
    expect(keyGen).toBeInstanceOf(EVMKeyGenerator)
  })

  it('should create an EVMKeyGenerator instance for Polygon network', () => {
    const keyGen = KeyGeneratorFactory.create(Network.Polygon)
    expect(keyGen).toBeInstanceOf(EVMKeyGenerator)
  })

  it('should create a MinaKeyGenerator instance for Mina network', () => {
    const keyGen = KeyGeneratorFactory.create(Network.Mina)
    expect(keyGen).toBeInstanceOf(MinaKeyGenerator)
  })

  it('should throw an error for unsupported network', () => {
    expect(() =>
      KeyGeneratorFactory.create('UnknownNetwork' as Network)
    ).toThrow('Unsupported network: UnknownNetwork')
  })
})
