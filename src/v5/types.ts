import { BigNumberish, BytesLike } from "ethers"

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
