import { TypedDataField } from "@ethersproject/abstract-signer"

export enum SignatureType {
    Illegal = "00", // 0x00, default value
    Invalid = "01", // 0x01
    EIP712 = "02", // 0x02
    EthSign = "03", // 0x03
    WalletBytes = "04", // 0x04  standard 1271 wallet type
    WalletBytes32 = "05", // 0x05  standard 1271 wallet type
    Wallet = "06", // 0x06  0x wallet type for signature compatibility
    NSignatureTypes = "07", // 0x07, number of signature types. Always leave at end.
}

export type SigningOptions = {
    type: SignatureType
    verifyingContract: string
}

/* EIP712 */

export type EIP712Domain = {
    name: string
    version: string
    chainId: number
    verifyingContract: string
}
export type EIP712Types = Record<string, TypedDataField[]>
export type EIP712Value = Record<string, any>

export interface EIP712Signer {
    getAddress(): Promise<string>
    getChainId(): Promise<number>
    _signTypedData(domain: EIP712Domain, types: EIP712Types, value: EIP712Value): Promise<string>
}
