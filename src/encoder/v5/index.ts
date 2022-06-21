import { BigNumberish, ethers } from "ethers"

import { UniswapV3Fee, encodeUniswapV3Path } from "../utils/uniswap"
import { abiAMMWrapperWithPath } from "./abi"

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

export class EncoderV5 {
    /* AMM */

    public encodeAMMTradeWithPath(data: AMMTradeWithPathData): string {
        const i = new ethers.utils.Interface(abiAMMWrapperWithPath)
        return i.encodeFunctionData("trade", [
            [
                data.makerAddr,
                data.takerAssetAddr,
                data.makerAssetAddr,
                data.takerAssetAmount,
                data.makerAssetAmount,
                data.userAddr,
                data.receiverAddr,
                data.salt,
                data.deadline,
            ],
            data.feeFactor,
            data.signature,
            data.makerSpecificData,
            data.path,
        ])
    }

    public encodeAMMUniswapV3SingleHop(fee: UniswapV3Fee): string {
        const swapType = 1
        return ethers.utils.defaultAbiCoder.encode(["uint8", "uint24"], [swapType, fee])
    }

    public encodeAMMUniswapV3MultiHops(path: string[], fees: UniswapV3Fee[]): string {
        const swapType = 2
        const uniswapV3Path = encodeUniswapV3Path(path, fees)
        return ethers.utils.defaultAbiCoder.encode(["uint8", "bytes"], [swapType, uniswapV3Path])
    }
}
