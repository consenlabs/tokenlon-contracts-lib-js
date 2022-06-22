import { BigNumberish } from "ethers"

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
    signature: string
    makerSpecificData: string
    path: string[]
}
