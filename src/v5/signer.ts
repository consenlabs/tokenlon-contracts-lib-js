import { EIP712DomainOptions, Signer as BaseSigner, SigningOptions } from "../signer"
import { AMMOrder } from "./types"

export class Signer extends BaseSigner {
    public constructor() {
        super({
            name: "Tokenlon",
            version: "v5",
        })
    }

    /* AMM */

    public getAMMOrderEIP712Types() {
        return {
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
    }

    public async getAMMOrderEIP712Digest(order: AMMOrder, options: EIP712DomainOptions) {
        return this.getEIP712Digest(
            await this.getEIP712Domain(options),
            this.getAMMOrderEIP712Types(),
            order,
        )
    }

    public getAMMOrderEIP712StructHash(order: AMMOrder) {
        return this.getEIP712StructHash("tradeWithPermit", this.getAMMOrderEIP712Types(), order)
    }

    public async signAMMOrder(order: AMMOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getAMMOrderEIP712Types(), order, options)
    }
}
