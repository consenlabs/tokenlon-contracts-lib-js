import { _TypedDataEncoder } from "ethers/lib/utils"
import { keccak_256 } from "@noble/hashes/sha3"
import { hexToBytes, utf8ToBytes } from "@noble/hashes/utils"
import { AllowFill, GenericSwapData, LimitOrder, RFQOffer, RFQTx } from "./types"

import {
    EIP712DomainOptions,
    EIP712Types,
    SigningHelper as BaseSigningHelper,
    SigningOptions,
} from "../signing"

export class SigningHelper extends BaseSigningHelper {
    public constructor() {
        super({
            name: "Tokenlon",
            version: "v6",
        })
    }

    private toBuffer = (data: string, encoding: "utf8" | "hex" = "hex"): Uint8Array => {
        if (encoding === "hex") {
            if (data.startsWith("0x")) {
                return hexToBytes(data.substring(2))
            }
            return hexToBytes(data)
        }
        return utf8ToBytes(data)
    }

    private keccak256 = (data: string | Uint8Array, encoding?: "utf8" | "hex"): String => {
        if (typeof data === "string" && encoding === "utf8") {
            return "0x" + Buffer.from(keccak_256(this.toBuffer(data, encoding))).toString("hex")
        }
        return "0x" + Buffer.from(keccak_256(data)).toString("hex")
    }

    /* AllowFill */
    public getAllowFillEIP712Types(): EIP712Types {
        return {
            AllowFill: [
                { name: "orderHash", type: "bytes32" },
                { name: "taker", type: "address" },
                { name: "fillAmount", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "uint256" },
            ],
        }
    }

    public async getAllowFillEIP712Digest(
        allowFill: AllowFill,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getAllowFillEIP712Types()
        return this.getEIP712Digest(domain, types, allowFill)
    }

    public getAllowFillEIP712StructHash(allowFill: AllowFill): string {
        return this.getEIP712StructHash("AllowFill", this.getAllowFillEIP712Types(), allowFill)
    }

    public getAllowFillEIP712Typehash(): String {
        return this.keccak256(
            _TypedDataEncoder.from(this.getAllowFillEIP712Types()).encodeType("AllowFill"),
            "utf8",
        )
    }

    public signAllowFill(allowFill: AllowFill, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getAllowFillEIP712Types(), allowFill, options, true)
    }

    /* GenericSwapData */
    public getGenericSwapDataEIP712Types(): EIP712Types {
        return {
            GenericSwapData: [
                { name: "maker", type: "address" },
                { name: "takerToken", type: "address" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "makerToken", type: "address" },
                { name: "makerTokenAmount", type: "uint256" },
                { name: "minMakerTokenAmount", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "uint256" },
                { name: "recipient", type: "address" },
                { name: "strategyData", type: "bytes" },
            ],
        }
    }

    public async getGenericSwapDataEIP712Digest(
        genericSwapData: GenericSwapData,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getGenericSwapDataEIP712Types()
        return this.getEIP712Digest(domain, types, genericSwapData)
    }

    public getGenericSwapDataEIP712StructHash(genericSwapData: GenericSwapData): string {
        return this.getEIP712StructHash(
            "GenericSwapData",
            this.getGenericSwapDataEIP712Types(),
            genericSwapData,
        )
    }

    public getGenericSwapDataEIP712Typehash(): String {
        return this.keccak256(
            _TypedDataEncoder
                .from(this.getGenericSwapDataEIP712Types())
                .encodeType("GenericSwapData"),
            "utf8",
        )
    }

    public signGenericSwapData(
        genericSwapData: GenericSwapData,
        options: SigningOptions,
    ): Promise<string> {
        return this.signEIP712(this.getGenericSwapDataEIP712Types(), genericSwapData, options, true)
    }

    /* LimitOrder */
    public getLimitOrderEIP712Types(): EIP712Types {
        return {
            LimitOrder: [
                { name: "taker", type: "address" },
                { name: "maker", type: "address" },
                { name: "takerToken", type: "address" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "makerToken", type: "address" },
                { name: "makerTokenAmount", type: "uint256" },
                { name: "makerTokenPermit", type: "bytes" },
                { name: "feeFactor", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "uint256" },
            ],
        }
    }

    public async getLimitOrderEIP712Digest(
        limitOrder: LimitOrder,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getLimitOrderEIP712Types()
        return this.getEIP712Digest(domain, types, limitOrder)
    }

    public getLimitOrderEIP712StructHash(limitOrder: LimitOrder): string {
        return this.getEIP712StructHash("LimitOrder", this.getLimitOrderEIP712Types(), limitOrder)
    }

    public getLimitOrderEIP712Typehash(): String {
        return this.keccak256(
            _TypedDataEncoder.from(this.getLimitOrderEIP712Types()).encodeType("LimitOrder"),
            "utf8",
        )
    }

    public signLimitOrder(limitOrder: LimitOrder, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getLimitOrderEIP712Types(), limitOrder, options, true)
    }

    /* RFQOffer */
    public getRFQOfferEIP712Types(): EIP712Types {
        return {
            RFQOffer: [
                { name: "taker", type: "address" },
                { name: "maker", type: "address" },
                { name: "takerToken", type: "address" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "makerToken", type: "address" },
                { name: "makerTokenAmount", type: "uint256" },
                { name: "feeFactor", type: "uint256" },
                { name: "flags", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "uint256" },
            ],
        }
    }

    public async getRFQOfferEIP712Digest(
        rfqOffer: RFQOffer,
        options: EIP712DomainOptions,
    ): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getRFQOfferEIP712Types()
        return this.getEIP712Digest(domain, types, rfqOffer)
    }

    public getRFQOfferEIP712StructHash(rfqOffer: RFQOffer): string {
        return this.getEIP712StructHash("RFQOffer", this.getRFQOfferEIP712Types(), rfqOffer)
    }

    public getRFQOfferEIP712Typehash(): String {
        return this.keccak256(
            _TypedDataEncoder.from(this.getRFQOfferEIP712Types()).encodeType("RFQOffer"),
            "utf8",
        )
    }

    public signRFQOffer(rfqOffer: RFQOffer, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQOfferEIP712Types(), rfqOffer, options, true)
    }

    /* RFQTx */
    public getRFQTxEIP712Types(): EIP712Types {
        return {
            RFQOffer: [
                { name: "taker", type: "address" },
                { name: "maker", type: "address" },
                { name: "takerToken", type: "address" },
                { name: "takerTokenAmount", type: "uint256" },
                { name: "makerToken", type: "address" },
                { name: "makerTokenAmount", type: "uint256" },
                { name: "feeFactor", type: "uint256" },
                { name: "flags", type: "uint256" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "uint256" },
            ],
            RFQTx: [
                { name: "rfqOffer", type: "RFQOffer" },
                { name: "recipient", type: "address" },
                { name: "takerRequestAmount", type: "uint256" },
            ],
        }
    }

    public async getRFQTxEIP712Digest(rfqTx: RFQTx, options: EIP712DomainOptions): Promise<string> {
        const domain = await this.getEIP712Domain(options)
        const types = this.getRFQTxEIP712Types()
        return this.getEIP712Digest(domain, types, rfqTx)
    }

    public getRFQTxEIP712StructHash(rfqTx: RFQTx): string {
        return this.getEIP712StructHash("RFQTx", this.getRFQTxEIP712Types(), rfqTx)
    }

    public getRFQTxEIP712Typehash(): String {
        return this.keccak256(
            _TypedDataEncoder.from(this.getRFQTxEIP712Types()).encodeType("RFQTx"),
            "utf8",
        )
    }

    public signRFQTx(rfqTx: RFQTx, options: SigningOptions): Promise<string> {
        return this.signEIP712(this.getRFQTxEIP712Types(), rfqTx, options, true)
    }
}
