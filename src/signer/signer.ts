import crypto from "crypto"
import { BigNumber } from "ethers"
import { _TypedDataEncoder } from "@ethersproject/hash"

import {
    EIP712Domain,
    EIP712DomainOptions,
    EIP712Types,
    EIP712Value,
    SignatureType,
    SigningOptions,
} from "./types"

export type SignerOptions = {
    name: string
    version: string
}

export class Signer {
    public name: string
    public version: string

    public constructor(options: SignerOptions) {
        this.name = options.name
        this.version = options.version
    }

    public generateRandomSalt(): BigNumber {
        const randomBytes = crypto.randomBytes(32)
        return BigNumber.from(randomBytes)
    }

    public async getEIP712Domain(options: EIP712DomainOptions): Promise<EIP712Domain> {
        return {
            name: this.name,
            version: this.version,
            chainId: options.chainId,
            verifyingContract: options.verifyingContract,
        }
    }

    // Reference: https://eips.ethereum.org/EIPS/eip-712#specification
    // "\x19\x01" ‖ hashStruct(domain) ‖ hashStruct(types, value)
    public getEIP712Digest(domain: EIP712Domain, types: EIP712Types, value: EIP712Value): string {
        return _TypedDataEncoder.hash(domain, types, value)
    }

    // Reference: https://eips.ethereum.org/EIPS/eip-712#definition-of-hashstruct
    // keccak256(keccak256(encodeType(types[name]) ‖ encodeData(value))
    public getEIP712StructHash(name: string, types: EIP712Types, value: EIP712Value): string {
        return _TypedDataEncoder.hashStruct(name, types, value)
    }

    public async signEIP712(
        types: EIP712Types,
        value: EIP712Value,
        options: SigningOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain({
            chainId: await options.signer.getChainId(),
            verifyingContract: options.verifyingContract,
        })
        const signature = await options.signer._signTypedData(domain, types, value)
        const signatureComposed = this.composeSignature(signature, options.type)
        return signatureComposed
    }

    public composeSignature(signature: string, type: SignatureType) {
        const paddedNonce = "00".repeat(32)
        return signature + paddedNonce + type
    }
}
