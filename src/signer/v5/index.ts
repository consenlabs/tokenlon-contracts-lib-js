import { BigNumberish } from "ethers"
import { EIP712Signer } from "../eip712"
import { Signer, SigningOptions, SigningResult } from "../signer"

export * from "../signer"

export type AMMOrder = {
    makerAddr: string
    takerAssetAddr: string
    makerAssetAddr: string
    takerAssetAmount: BigNumberish
    makerAssetAmount: BigNumberish
    userAddr: string
    receiverAddr: string
    salt: BigNumberish
    deadline: number
}

export class SignerV5 extends Signer {
    public constructor() {
        super({
            name: "Tokenlon",
            version: "v5",
        })
    }

    /* AMM */

    public async signAMMOrder(order: AMMOrder, options: SigningOptions): Promise<SigningResult> {
        const types = {
            tradeWithPermit: [
                { name: "makerAddr", type: "address" },
                { name: "takerAssetAddr", type: "address" },
                { name: "makerAssetAddr", type: "address" },
                { name: "takerAssetAmount", type: "uint256" },
                { name: "makerAssetAmount", type: "uint256" },
                { name: "userAddr", type: "address" },
                { name: "receiverAddr", type: "address" },
                { name: "salt", type: "uint256" },
                { name: "deadline", type: "uint256" },
            ],
        }
        return this.signEIP712(types, order, options)
    }
}
