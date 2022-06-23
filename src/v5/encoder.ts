import { ethers } from "ethers"

import { UniswapV3Fee, encodeUniswapV3Path } from "../uniswap"
import { abiAMMWrapperWithPath } from "./abi"
import { AMMTradeWithPathData } from "./types"

export class Encoder {
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

    public encodeAMMUniswapV3SingleHopData(fee: UniswapV3Fee): string {
        const swapType = 1
        return ethers.utils.defaultAbiCoder.encode(["uint8", "uint24"], [swapType, fee])
    }

    public encodeAMMUniswapV3MultiHopsData(path: string[], fees: UniswapV3Fee[]): string {
        const swapType = 2
        const uniswapV3Path = encodeUniswapV3Path(path, fees)
        return ethers.utils.defaultAbiCoder.encode(["uint8", "bytes"], [swapType, uniswapV3Path])
    }

    public encodeAMMCurveData(version: number): string {
        return ethers.utils.defaultAbiCoder.encode(["uint8"], [version])
    }
}
