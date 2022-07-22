import { Wallet } from "ethers"
import { ethers } from "hardhat"
import { SnapshotRestorer, takeSnapshot } from "@nomicfoundation/hardhat-network-helpers"

import { Addresses, addresses } from "@network"
import {
    IAllowanceTarget,
    IAMMWrapper,
    IAMMWrapperWithPath,
    ILimitOrder,
    IRFQ,
    IUserProxy,
    IERC20,
    IUniswapV2Router,
    IUniswapV3Quoter,
    IUniswapV3Router,
} from "@typechain"

import { dealETH } from "./balance"

export type Context = {
    wallet: {
        user: Wallet
    }
    token: {
        DAI: IERC20
        USDC: IERC20
        USDT: IERC20
        WETH: IERC20
    }
    tokenlon: {
        AllowanceTarget: IAllowanceTarget
        AMMWrapper: IAMMWrapper
        AMMWrapperWithPath: IAMMWrapperWithPath
        LimitOrder: ILimitOrder
        RFQ: IRFQ
        UserProxy: IUserProxy
    }
    uniswap: {
        UniswapV2Router: IUniswapV2Router
        UniswapV3Quoter: IUniswapV3Quoter
        UniswapV3Router: IUniswapV3Router
    }
    sushiswap: {
        SushiswapRouter: IUniswapV2Router
    }
    network: {
        addresses: Addresses
        chainId: number
    }
    snapshot: SnapshotRestorer
}

const __ctx__ = setupContext()

async function setupContext(): Promise<Context> {
    return {
        wallet: {
            user: Wallet.createRandom().connect(ethers.provider),
        },
        token: {
            DAI: await ethers.getContractAt("IERC20", addresses.DAI),
            USDC: await ethers.getContractAt("IERC20", addresses.USDC),
            USDT: await ethers.getContractAt("IERC20", addresses.USDT),
            WETH: await ethers.getContractAt("IERC20", addresses.WETH),
        },
        tokenlon: {
            AllowanceTarget: await ethers.getContractAt(
                "IAllowanceTarget",
                addresses.AllowanceTarget,
            ),
            AMMWrapper: await ethers.getContractAt("IAMMWrapper", addresses.AMMWrapper),
            AMMWrapperWithPath: await ethers.getContractAt(
                "IAMMWrapperWithPath",
                addresses.AMMWrapperWithPath,
            ),
            LimitOrder: await ethers.getContractAt("ILimitOrder", addresses.LimitOrder),
            RFQ: await ethers.getContractAt("IRFQ", addresses.RFQ),
            UserProxy: await ethers.getContractAt("IUserProxy", addresses.UserProxy),
        },
        uniswap: {
            UniswapV2Router: await ethers.getContractAt(
                "IUniswapV2Router",
                addresses.UniswapV2Router,
            ),
            UniswapV3Quoter: await ethers.getContractAt(
                "IUniswapV3Quoter",
                addresses.UniswapV3Quoter,
            ),
            UniswapV3Router: await ethers.getContractAt(
                "IUniswapV3Router",
                addresses.UniswapV3Router,
            ),
        },
        sushiswap: {
            SushiswapRouter: await ethers.getContractAt(
                "IUniswapV2Router",
                addresses.SushiswapRouter,
            ),
        },
        network: {
            addresses: addresses,
            chainId: (await ethers.provider.getNetwork()).chainId,
        },
        snapshot: await takeSnapshot(),
    }
}

interface ContextSuiteFunction {
    (title: string, suite: (ctx: Context) => void, decorator?: "only" | "skip"): Promise<void>
    only: (title: string, suite: (ctx: Context) => void) => Promise<void>
    skip: (title: string, suite: (ctx: Context) => void) => Promise<void>
}

export const contextSuite = async function (
    title: string,
    suite: (ctx: Context) => void,
    decorator?: "only" | "skip",
) {
    const ctx = await __ctx__

    ;(decorator ? describe[decorator] : describe)(title, () => {
        let snapshot: SnapshotRestorer

        before(async () => {
            await ctx.snapshot.restore()
            await Promise.all(
                Object.values(ctx.wallet).map((w) => dealETH(w, ethers.utils.parseEther("100"))),
            )
        })

        suite(ctx)

        before(async () => {
            snapshot = await takeSnapshot()
        })

        beforeEach(async () => {
            await snapshot.restore()
        })
    })
} as ContextSuiteFunction

contextSuite.only = function (title: string, suite: (ctx: Context) => void) {
    return contextSuite(title, suite, "only")
}

contextSuite.skip = function (title: string, suite: (ctx: Context) => void) {
    return contextSuite(title, suite, "skip")
}

__ctx__.then(() => setTimeout(run, 0))
__ctx__.catch((e) => console.error(e))
