import { BytesLike, BigNumberish } from "ethers"

export type AllowFill = {
    orderHash: BytesLike
    taker: string
    fillAmount: BigNumberish
    expiry: BigNumberish
    salt: BigNumberish
}

export type GenericSwapData = {
    maker: string
    takerToken: string
    takerTokenAmount: BigNumberish
    makerToken: string
    makerTokenAmount: BigNumberish
    minMakerTokenAmount: BigNumberish
    expiry: BigNumberish
    salt: BigNumberish
    recipient: string
    strategyData: BytesLike
}

export type LimitOrder = {
    taker: string
    maker: string
    takerToken: string
    takerTokenAmount: BigNumberish
    makerToken: string
    makerTokenAmount: BigNumberish
    makerTokenPermit: BytesLike
    feeFactor: BigNumberish
    expiry: BigNumberish
    salt: BigNumberish
}

export type RFQOffer = {
    taker: string
    maker: string
    takerToken: string
    takerTokenAmount: BigNumberish
    makerToken: string
    makerTokenAmount: BigNumberish
    feeFactor: BigNumberish
    flags: BigNumberish
    expiry: BigNumberish
    salt: BigNumberish
}

export type RFQTx = {
    rfqOffer: RFQOffer
    recipient: string
    takerRequestAmount: BigNumberish
}
