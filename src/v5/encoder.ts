import { ethers } from "ethers"

import { encodeUniswapV3Path } from "../uniswap"
import abi from "./abi"
import { AMMTradeData, AMMTradeWithPathData, RFQFillData } from "./types"

export class Encoder {
    /* AMM */

    public encodeAMMTrade(data: AMMTradeData): string {
        const i = new ethers.utils.Interface(abi.AMMWrapper)
        return i.encodeFunctionData("trade", [
            data.makerAddr,
            data.takerAssetAddr,
            data.makerAssetAddr,
            data.takerAssetAmount,
            data.makerAssetAmount,
            data.feeFactor,
            data.userAddr,
            data.receiverAddr,
            data.salt,
            data.deadline,
            data.signature,
        ])
    }

    public encodeAMMTradeWithPath(data: AMMTradeWithPathData): string {
        const i = new ethers.utils.Interface(abi.AMMWrapperWithPath)
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

    public encodeAMMUniswapV3SingleHopData(fee: number): string {
        const swapType = 1
        return ethers.utils.defaultAbiCoder.encode(["uint8", "uint24"], [swapType, fee])
    }

    public encodeAMMUniswapV3MultiHopsData(path: string[], fees: number[]): string {
        const swapType = 2
        const uniswapV3Path = encodeUniswapV3Path(path, fees)
        return ethers.utils.defaultAbiCoder.encode(["uint8", "bytes"], [swapType, uniswapV3Path])
    }

    public encodeAMMCurveData(version: number): string {
        return ethers.utils.defaultAbiCoder.encode(["uint8"], [version])
    }

    /* RFQ */

    public encodeRFQFill(data: RFQFillData): string {
        const i = new ethers.utils.Interface(abi.RFQ)
        return i.encodeFunctionData("fill", [
            [
                data.takerAddr,
                data.makerAddr,
                data.takerAssetAddr,
                data.makerAssetAddr,
                data.takerAssetAmount,
                data.makerAssetAmount,
                data.receiverAddr,
                data.salt,
                data.deadline,
                data.feeFactor,
            ],
            data.makerSignature,
            data.takerSignature,
        ])
    }
}
