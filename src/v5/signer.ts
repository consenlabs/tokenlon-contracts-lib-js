import { EIP712DomainOptions, EIP712Types, Signer as BaseSigner, SigningOptions } from "../signer"
import { AMMOrder, RFQMakerOrder, RFQTakerOrder } from "./types"

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
        return this.getEIP712Digest(
            await this.getEIP712Domain(options),
            this.getAMMOrderEIP712Types(),
            order,
        )
    }

    public getAMMOrderEIP712StructHash(order: AMMOrder): string {
        return this.getEIP712StructHash("tradeWithPermit", this.getAMMOrderEIP712Types(), order)
    }

    public signAMMOrder(order: AMMOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getAMMOrderEIP712Types(), order, options)
    }

    /* RFQ - Maker Order */

    public getRFQMakerOrderEIP712Types(): EIP712Types {
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

    public async getRFQMakerOrderEIP712Digest(
        order: RFQMakerOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        return this.getEIP712Digest(
            await this.getEIP712Domain(options),
            this.getRFQMakerOrderEIP712Types(),
            order,
        )
    }

    public getRFQMakerOrderEIP712StructHash(order: RFQMakerOrder): string {
        return this.getEIP712StructHash("Order", this.getRFQMakerOrderEIP712Types(), order)
    }

    public signRFQMakerOrder(order: RFQMakerOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQMakerOrderEIP712Types(), order, options)
    }

    /* RFQ - Taker Order */

    public getRFQTakerOrderEIP712Types(): EIP712Types {
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

    public async getRFQTakerOrderEIP712Digest(
        order: RFQTakerOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        return this.getEIP712Digest(
            await this.getEIP712Domain(options),
            this.getRFQTakerOrderEIP712Types(),
            order,
        )
    }

    public getRFQTakerOrderEIP712StructHash(order: RFQTakerOrder): string {
        return this.getEIP712StructHash("fillWithPermit", this.getRFQTakerOrderEIP712Types(), order)
    }

    public signRFQTakerOrder(order: RFQTakerOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQTakerOrderEIP712Types(), order, options)
    }
}
