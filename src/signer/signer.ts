import crypto from "crypto"
import { BigNumber, VoidSigner } from "ethers"
import { _TypedDataEncoder } from "@ethersproject/hash"

import {
    EIP712Domain,
    EIP712Signer,
    EIP712Types,
    EIP712Value,
    SignatureType,
    SigningOptions,
} from "./types"

export type SignerOptions = {
    name: string
    version: string
}

export abstract class Signer {
    public name: string
    public version: string

    private signer: EIP712Signer = new VoidSigner("")

    public constructor(options: SignerOptions) {
        this.name = options.name
        this.version = options.version
    }

    public connect(signer: EIP712Signer): this {
        const result: this = Reflect.construct(this.constructor, [
            {
                name: this.name,
                version: this.version,
            },
        ])
        result.signer = signer
        return result
    }

    public generateRandomSalt(): BigNumber {
        const randomBytes = crypto.randomBytes(32)
        return BigNumber.from(randomBytes)
    }

    public getEIP712Domain(chainId: number, verifyingContract: string): EIP712Domain {
        return {
            name: this.name,
            version: this.version,
            chainId,
            verifyingContract,
        }
    }

    public getEIP712Digest(domain: EIP712Domain, types: EIP712Types, value: EIP712Value): string {
        return _TypedDataEncoder.hash(domain, types, value)
    }

    public getEIP712StructHash(name: string, types: EIP712Types, value: EIP712Value): string {
        return _TypedDataEncoder.hashStruct(name, types, value)
    }

    public async signEIP712(
        types: EIP712Types,
        value: EIP712Value,
        options: SigningOptions,
    ): Promise<string> {
        const domain = this.getEIP712Domain(
            await this.signer.getChainId(),
            options.verifyingContract,
        )
        const signature = await this.signer._signTypedData(domain, types, value)
        const signatureComposed = this.composeSignature(signature, options.type)
        return signatureComposed
    }

    public composeSignature(signature: string, type: SignatureType) {
        const paddedNonce = "00".repeat(32)
        return signature + paddedNonce + type
    }
}
