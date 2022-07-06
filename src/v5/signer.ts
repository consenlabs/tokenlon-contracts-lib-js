import { EIP712DomainOptions, EIP712Types, Signer as BaseSigner, SigningOptions } from "../signer"
import { AMMOrder, RFQOrder, RFQFill } from "./types"

export class Signer extends BaseSigner {
    public constructor() {
        super({
            name: "Tokenlon",
            version: "v5",
        })
    }

    /* AMM */

    public getAMMOrderEIP712Types(): EIP712Types {
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

    public async getAMMOrderEIP712Digest(
        order: AMMOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getAMMOrderEIP712Types()
        return this.getEIP712Digest(domain, types, order)
    }

    public getAMMOrderEIP712StructHash(order: AMMOrder): string {
        return this.getEIP712StructHash("tradeWithPermit", this.getAMMOrderEIP712Types(), order)
    }

    public signAMMOrder(order: AMMOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getAMMOrderEIP712Types(), order, options)
    }

    /* RFQ - Order (for maker) */

    public getRFQOrderEIP712Types(): EIP712Types {
        return {
            Order: [
                { name: "takerAddr", type: "address" },
                { name: "makerAddr", type: "address" },
                { name: "takerAssetAddr", type: "address" },
                { name: "makerAssetAddr", type: "address" },
                { name: "takerAssetAmount", type: "uint256" },
                { name: "makerAssetAmount", type: "uint256" },
                { name: "salt", type: "uint256" },
                { name: "deadline", type: "uint256" },
                { name: "feeFactor", type: "uint256" },
            ],
        }
    }

    public async getRFQOrderEIP712Digest(
        order: RFQOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getRFQOrderEIP712Types()
        return this.getEIP712Digest(domain, types, order)
    }

    public getRFQOrderEIP712StructHash(order: RFQOrder): string {
        return this.getEIP712StructHash("Order", this.getRFQOrderEIP712Types(), order)
    }

    public signRFQOrder(order: RFQOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQOrderEIP712Types(), order, options)
    }

    /* RFQ - Fill (for taker) */

    public getRFQFillEIP712Types(): EIP712Types {
        return {
            fillWithPermit: [
                { name: "makerAddr", type: "address" },
                { name: "takerAssetAddr", type: "address" },
                { name: "makerAssetAddr", type: "address" },
                { name: "takerAssetAmount", type: "uint256" },
                { name: "makerAssetAmount", type: "uint256" },
                { name: "takerAddr", type: "address" },
                { name: "receiverAddr", type: "address" },
                { name: "salt", type: "uint256" },
                { name: "deadline", type: "uint256" },
                { name: "feeFactor", type: "uint256" },
            ],
        }
    }

    public async getRFQFillEIP712Digest(
        fill: RFQFill,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getRFQFillEIP712Types()
        return this.getEIP712Digest(domain, types, fill)
    }

    public getRFQFillEIP712StructHash(order: RFQFill): string {
        return this.getEIP712StructHash("fillWithPermit", this.getRFQFillEIP712Types(), order)
    }

    public signRFQFillOrder(fill: RFQFill, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQFillEIP712Types(), fill, options)
    }
}
