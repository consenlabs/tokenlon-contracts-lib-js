import crypto from "crypto"
import { BigNumber, VoidSigner, ethers } from "ethers"
import { _TypedDataEncoder } from "@ethersproject/hash"

import {
    EIP712Domain,
    EIP712Signer,
    EIP712Types,
    EIP712Value,
    ETHSigner,
    SignatureType,
    SigningOptions,
    SigningResult,
} from "./types"

export type SignerOptions = {
    name: string
    version: string
}

export abstract class Signer {
    public name: string
    public version: string
    private signer: ETHSigner | EIP712Signer = new VoidSigner("")

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
        const structHash = _TypedDataEncoder.hashStruct(Object.keys(types)[0], types, value)
        const digest = _TypedDataEncoder.hash(domain, types, value)
        const typedDataSig =
            options.type === SignatureType.EthSign
                ? await (this.signer as ETHSigner).signMessage(ethers.utils.arrayify(digest))
                : await (this.signer as EIP712Signer)._signTypedData(domain, types, value)
        const paddedNonce = "00".repeat(32)
        const signature = typedDataSig + paddedNonce + options.type
        return {
            structHash,
            digest,
            signature,
        }
    }
}
