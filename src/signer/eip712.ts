import { VoidSigner } from "ethers"
import { TypedDataField, TypedDataSigner } from "@ethersproject/abstract-signer"

export type EIP712Domain = {
    name: string
    version: string
    chainId: number
    verifyingContract: string
}
export type EIP712Types = Record<string, TypedDataField[]>
export type EIP712Value = Record<string, any>

export interface EIP712Signer extends TypedDataSigner {
    getAddress(): Promise<string>
    getChainId(): Promise<number>
}

export class VoidEIP712Signer extends VoidSigner {
    public constructor() {
        super("0x01")
    }

    public getAddress(): Promise<string> {
        return this._fail("VoidSigner has no address", "getAddress")
    }
}
