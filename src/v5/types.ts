import { BigNumberish, BytesLike } from "ethers"

/* AMM */

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

export type AMMTradeData = {
    makerAddr: string
    takerAssetAddr: string
    makerAssetAddr: string
    takerAssetAmount: BigNumberish
    makerAssetAmount: BigNumberish
    feeFactor: BigNumberish
    userAddr: string
    receiverAddr: string
    salt: BigNumberish
    deadline: number
    signature: BytesLike
}

export type AMMTradeWithPathData = {
    makerAddr: string
    takerAssetAddr: string
    makerAssetAddr: string
    takerAssetAmount: BigNumberish
    makerAssetAmount: BigNumberish
    userAddr: string
    receiverAddr: string
    salt: BigNumberish
    deadline: number
    feeFactor: number
    signature: BytesLike
    makerSpecificData: string
    path: string[]
}

/* Limit Order */

export type LimitOrder = {
    makerToken: string
    takerToken: string
    makerTokenAmount: BigNumberish
    takerTokenAmount: BigNumberish
    maker: string
    taker: string
    salt: BigNumberish
    expiry: number
}

export type LimitOrderFill = {
    orderHash: string // LimitOrder EIP712 digest
    taker: string
    recipient: string
    takerTokenAmount: BigNumberish
    takerSalt: BigNumberish
    expiry: number
}

export type LimitOrderAllowFill = {
    orderHash: string // LimitOrder EIP712 digest
    executor: string
    fillAmount: BigNumberish
    salt: BigNumberish
    expiry: number
}

export type LimitOrderFillByTraderData = {
    // maker
    order: LimitOrder
    makerSignature: BytesLike

    // taker
    fill: LimitOrderFill
    takerSignature: BytesLike

    // coordinator
    allowFill: {
        salt: BigNumberish
        expiry: number
    }
    coordinatorSignature: BytesLike
}

/* RFQ */

export type RFQOrder = {
    takerAddr: string
    makerAddr: string
    takerAssetAddr: string
    makerAssetAddr: string
    takerAssetAmount: BigNumberish
    makerAssetAmount: BigNumberish
    salt: BigNumberish
    deadline: number
    feeFactor: number
}

export type RFQFill = RFQOrder & {
    receiverAddr: string
}

export type RFQFillData = {
    takerAddr: string
    makerAddr: string
    takerAssetAddr: string
    makerAssetAddr: string
    takerAssetAmount: BigNumberish
    makerAssetAmount: BigNumberish
    receiverAddr: string
    salt: BigNumberish
    deadline: number
    feeFactor: number
    makerSignature: BytesLike
    takerSignature: BytesLike
}
