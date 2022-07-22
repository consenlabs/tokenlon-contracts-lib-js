import {
    EIP712DomainOptions,
    EIP712Types,
    SigningHelper as BaseSigningHelper,
    SigningOptions,
} from "@src/signing"
import {
    AMMOrder,
    LimitOrder,
    LimitOrderAllowFill,
    LimitOrderFill,
    RFQFill,
    RFQOrder,
} from "./types"

export class SigningHelper extends BaseSigningHelper {
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

    /* Limit Order */

    public getLimitOrderEIP712Types(): EIP712Types {
        return {
            Order: [
                { name: "makerToken", type: "address" },
                { name: "takerToken", type: "address" },
                { name: "makerTokenAmount", type: "uint256" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "maker", type: "address" },
                { name: "taker", type: "address" },
                { name: "salt", type: "uint256" },
                { name: "expiry", type: "uint64" },
            ],
        }
    }

    public async getLimitOrderEIP712Digest(
        order: LimitOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getLimitOrderEIP712Types()
        return this.getEIP712Digest(domain, types, order)
    }

    public getLimitOrderEIP712StructHash(order: LimitOrder): string {
        return this.getEIP712StructHash("Order", this.getLimitOrderEIP712Types(), order)
    }

    public signLimitOrder(order: LimitOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getLimitOrderEIP712Types(), order, options)
    }

    /* Limit Order - Fill */

    public getLimitOrderFillEIP712Types(): EIP712Types {
        return {
            Fill: [
                { name: "orderHash", type: "bytes32" },
                { name: "taker", type: "address" },
                { name: "recipient", type: "address" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "takerSalt", type: "uint256" },
                { name: "expiry", type: "uint64" },
            ],
        }
    }

    public async getLimitOrderFillEIP712Digest(
        fill: LimitOrderFill,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getLimitOrderFillEIP712Types()
        return this.getEIP712Digest(domain, types, fill)
    }

    public getLimitOrderFillEIP712StructHash(fill: LimitOrderFill): string {
        return this.getEIP712StructHash("Fill", this.getLimitOrderFillEIP712Types(), fill)
    }

    public signLimitOrderFill(fill: LimitOrderFill, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getLimitOrderFillEIP712Types(), fill, options)
    }

    /* Limit Order - Allow Fill */

    public getLimitOrderAllowFillEIP712Types(): EIP712Types {
        return {
            AllowFill: [
                { name: "orderHash", type: "bytes32" },
                { name: "executor", type: "address" },
                { name: "fillAmount", type: "uint256" },
                { name: "salt", type: "uint256" },
                { name: "expiry", type: "uint64" },
            ],
        }
    }

    public async getLimitOrderAllowFillEIP712Digest(
        allowFill: LimitOrderAllowFill,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getLimitOrderAllowFillEIP712Types()
        return this.getEIP712Digest(domain, types, allowFill)
    }

    public getLimitOrderAllowFillEIP712StructHash(allowFill: LimitOrderAllowFill): string {
        return this.getEIP712StructHash(
            "AllowFill",
            this.getLimitOrderAllowFillEIP712Types(),
            allowFill,
        )
    }

    public signLimitOrderAllowFill(
        allowFill: LimitOrderAllowFill,
        options: SigningOptions,
    ): Promise<string> {
        return this.signEIP712(this.getLimitOrderAllowFillEIP712Types(), allowFill, options)
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
