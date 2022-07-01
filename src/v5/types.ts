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

/* RFQ */

export type RFQMakerOrder = {
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

export type RFQTakerOrder = RFQMakerOrder & {
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
