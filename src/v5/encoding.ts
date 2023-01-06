import { ethers } from "ethers"

import { encodeUniswapV3Path } from "@src/uniswap"
import abi from "./abi"
import {
    AMMTradeData,
    AMMTradeWithPathData,
    LimitOrderCancelData,
    LimitOrderFillByProtocolData,
    LimitOrderFillByTraderData,
    RFQFillData,
    L2DepositData,
    L2ArbitrumDepositData,
    L2OptimismDepositData,
} from "./types"

export class EncodingHelper {
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

    public encodeLimitOrderCancel(data: LimitOrderCancelData) {
        const i = new ethers.utils.Interface(abi.LimitOrder)
        return i.encodeFunctionData("cancelLimitOrder", [
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
            data.makerCancelSignature,
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

    /* L2 Deposit */

    // To comply with: https://github.com/consenlabs/tokenlon-contracts/blob/master/contracts/interfaces/IL2Deposit.sol#L29-L36
    public encodeL2Deposit(data: L2DepositData): string {
        const i = new ethers.utils.Interface(abi.L2Deposit)
        return i.encodeFunctionData("deposit", [
            [
                [
                    data.deposit.l2Identifier,
                    data.deposit.l1TokenAddr,
                    data.deposit.l2TokenAddr,
                    data.deposit.sender,
                    data.deposit.recipient,
                    data.deposit.amount,
                    data.deposit.salt,
                    data.deposit.expiry,
                    data.deposit.data,
                ],
                data.depositSig,
            ],
        ])
    }

    /* Vendor */

    public encodeL2ArbitrumDepositData(user: string, data: L2ArbitrumDepositData): string {
        return ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "uint256", "uint256"],
            [user, data.maxSubmissionCost, data.maxGas, data.gasPriceBid],
        )
    }

    public encodeL2OptimismDepositData(data: L2OptimismDepositData): string {
        return ethers.utils.defaultAbiCoder.encode(["uint32"], [data.l2Gas])
    }

    public encodeUniswapV2Path(path: string[]) {
        return ethers.utils.defaultAbiCoder.encode(["address[]"], [path])
    }

    public encodeUniswapV3Path(path: string[], fees: number[]) {
        return encodeUniswapV3Path(path, fees)
    }
}
