import crypto from "crypto"
import { BigNumber } from "ethers"
import { _TypedDataEncoder } from "@ethersproject/hash"

import { EIP712Domain, EIP712Types, EIP712Value, EIP712Signer, VoidEIP712Signer } from "./eip712"
import { SignerOptions, SigningOptions, SigningResult } from "./types"

export abstract class Signer {
    public name: string
    public version: string
    private signer: EIP712Signer = new VoidEIP712Signer()

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

    /* utils */

    public randomSalt(): BigNumber {
        const randomBytes = crypto.randomBytes(32)
        return BigNumber.from(randomBytes)
    }

    /* protected */

    protected async getEIP712Domain(options: SigningOptions): Promise<EIP712Domain> {
        return {
            name: this.name,
            version: this.version,
            chainId: await this.signer.getChainId(),
            verifyingContract: options.verifyingContract,
        }
    }

    protected async signEIP712(
        types: EIP712Types,
        value: EIP712Value,
        options: SigningOptions,
    ): Promise<SigningResult> {
        const domain = await this.getEIP712Domain(options)
        const txHash = _TypedDataEncoder.hashStruct(Object.keys(types)[0], types, value)
        const digest = _TypedDataEncoder.hash(domain, types, value)
        const typedDataSig = await this.signer._signTypedData(domain, types, value)
        const paddedNonce = "00".repeat(32)
        const signature = typedDataSig + paddedNonce + options.type
        return {
            txHash,
            digest,
            signature,
        }
    }
}
