import { TypedDataField } from "@ethersproject/abstract-signer"

export enum SignatureType {
    EIP712 = "02",
    WalletBytes = "04", // ERC1271 wallet type (isValidSignature(bytes,bytes))
    WalletBytes32 = "05", // ERC1271 wallet type (isValidSignature(bytes32,bytes))
}

export type SigningOptions = {
    type: SignatureType
    signer: EIP712Signer
    verifyingContract: string
    legacy?: boolean
}

/* EIP712 */

export type EIP712DomainOptions = {
    chainId: number
    verifyingContract: string
}

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
