import { ethers } from "ethers"

import { encodeUniswapV3Path } from "../uniswap"
import abi from "./abi"
import {
    AMMTradeData,
    AMMTradeWithPathData,
    LimitOrderFillByProtocolData,
    LimitOrderFillByTraderData,
    RFQFillData,
} from "./types"

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

    /* Limit Order */

    public encodeLimitOrderFillByTrader(data: LimitOrderFillByTraderData) {
        const i = new ethers.utils.Interface(abi.LimitOrder)
        return i.encodeFunctionData("fillLimitOrderByTrader", [
            [
                data.order.makerToken,
                data.order.takerToken,
                data.order.makerTokenAmount,
                data.order.takerTokenAmount,
                data.order.maker,
                data.order.taker,
                data.order.salt,
                data.order.expiry,
            ],
            data.makerSignature,
            [
                data.fill.taker,
                data.fill.recipient,
                data.fill.takerTokenAmount,
                data.fill.takerSalt,
                data.fill.expiry,
                data.takerSignature,
            ],
            [data.coordinatorSignature, data.allowFill.salt, data.allowFill.expiry],
        ])
    }

    public encodeLimitOrderFillByProtocol(data: LimitOrderFillByProtocolData) {
        const i = new ethers.utils.Interface(abi.LimitOrder)
        return i.encodeFunctionData("fillLimitOrderByProtocol", [
            [
                data.order.makerToken,
                data.order.takerToken,
                data.order.makerTokenAmount,
                data.order.takerTokenAmount,
                data.order.maker,
                data.order.taker,
                data.order.salt,
                data.order.expiry,
            ],
            data.makerSignature,
            [
                data.protocol.protocol,
                data.protocol.data,
                data.protocol.profitRecipient,
                data.protocol.takerTokenAmount,
                data.protocol.protocolOutMinimum,
                data.protocol.expiry,
            ],
            [data.coordinatorSignature, data.allowFill.salt, data.allowFill.expiry],
        ])
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

    /* Vendor */

    public encodePath(path: string[]) {
        return ethers.utils.defaultAbiCoder.encode(["address[]"], [path])
    }

    public encodeUniswapV3Path(path: string[], fees: number[]) {
        return encodeUniswapV3Path(path, fees)
    }
}
